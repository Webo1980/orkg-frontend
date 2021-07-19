import { useState, useEffect, useCallback } from 'react';
import { Row, Card, CardBody, CardTitle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import { getResource } from 'services/backend/resources';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { setComparisonProvenance, setComparisonCreatedBy } from 'actions/comparison';
import { MISC } from 'constants/graphSettings';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';

const StyledOrganizationCard = styled.div`
    border: 0;
    .logoContainer {
        padding: 1rem;
        position: relative;
        display: block;

        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 150px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 150px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;

function ProvenanceBox(props) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const { createdBy, provenance } = useSelector(state => state.comparison);
    const { id } = useSelector(state => state.comparison.object);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    const getObservatoryInfo = useCallback(async () => {
        /**
         * Load creator user
         *
         * @param {String} created_by user ID
         */
        const loadCreatedBy = created_by => {
            // Get Provenance data
            if (created_by && created_by !== MISC.UNKNOWN_ID) {
                getContributorInformationById(created_by)
                    .then(creator => {
                        dispatch(setComparisonCreatedBy(creator));
                    })
                    .catch(() => {
                        dispatch(setComparisonCreatedBy(null));
                    });
            } else {
                dispatch(setComparisonCreatedBy(null));
            }
        };

        /**
         * Load Provenance data
         *
         * @param {String} observatory_id observatory ID
         * @param {String} organization_id organization ID
         */
        const loadProvenanceInfos = (observatory_id, organization_id) => {
            if (observatory_id && observatory_id !== MISC.UNKNOWN_ID) {
                getObservatoryAndOrganizationInformation(observatory_id, organization_id).then(observatory => {
                    dispatch(setComparisonProvenance(observatory));
                });
            } else {
                dispatch(setComparisonProvenance(null));
            }
        };
        const resourceId = id;
        const comparisonResource = await getResource(resourceId);
        loadCreatedBy(comparisonResource.created_by);
        loadProvenanceInfos(comparisonResource.observatory_id, comparisonResource.organization_id);
    }, [dispatch, id]);

    useEffect(() => {
        getObservatoryInfo();
    }, [getObservatoryInfo, id]);

    if (isEmpty(provenance) && !createdBy && (!user || (!!user && !user.isCurationAllowed))) {
        return null;
    }

    return (
        <div className="container box rounded-lg mt-4">
            <Row>
                <div className="col-8 d-flex align-items-center ">
                    <div className="pt-4 pb-4 pl-4 pr-4">
                        {provenance && (
                            <>
                                <p>
                                    Observatory:{' '}
                                    {!!user && user.isCurationAllowed && (
                                        <Button size="sm" onClick={() => setShowAssignObservatory(true)} color="link">
                                            <Icon icon={faPen} /> Edit
                                        </Button>
                                    )}
                                </p>
                                <h4 className="mb-3">
                                    <Link to={reverse(ROUTES.OBSERVATORY, { id: provenance.id })}>{provenance.name}</Link>
                                </h4>
                            </>
                        )}
                        {createdBy && createdBy.id && (
                            <>
                                <i>Added by</i>
                                <br />
                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: createdBy.id })}>{createdBy.display_name}</Link>
                            </>
                        )}
                        <br /> <br />
                        {isEmpty(provenance) && !!user && user.isCurationAllowed && (
                            <Button size="sm" outline onClick={() => setShowAssignObservatory(true)}>
                                Assign to observatory
                            </Button>
                        )}
                    </div>
                </div>
                {provenance && provenance.organization && (
                    <div className="col-4">
                        <div className={!provenance.organization.logo ? 'm-4' : ''}>
                            {provenance.organization.logo && (
                                <StyledOrganizationCard className="card h-100 border-0">
                                    <Link className="logoContainer" to={reverse(ROUTES.ORGANIZATION, { id: provenance.organization.id })}>
                                        <img
                                            className="mx-auto p-2"
                                            src={provenance.organization.logo}
                                            alt={`${provenance.organization.name} logo`}
                                        />
                                    </Link>
                                </StyledOrganizationCard>
                            )}
                            {!provenance.organization.logo && (
                                <Card className="h-100">
                                    <CardBody className="d-flex">
                                        <CardTitle className="align-self-center text-center flex-grow-1">
                                            <Link to={reverse(ROUTES.ORGANIZATION, { id: provenance.organization.id })}>
                                                {provenance.organization.name}
                                            </Link>
                                        </CardTitle>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                <ObservatoryModal
                    callBack={() => getObservatoryInfo()}
                    showDialog={showAssignObservatory}
                    resourceId={id}
                    observatory={!isEmpty(provenance) ? provenance : null}
                    organization={!isEmpty(provenance) && !isEmpty(provenance.organization) ? provenance.organization : null}
                    toggle={() => setShowAssignObservatory(v => !v)}
                />
            </Row>
        </div>
    );
}

export default ProvenanceBox;
