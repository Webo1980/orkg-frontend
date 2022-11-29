import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import { useState } from 'react';
import useProvenance from 'components/Comparison/hooks/useProvenance';
import { Button } from 'reactstrap';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { isEmpty } from 'lodash';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';

const OrganizationBannerStyled = styled.div`
    float: right;
    border: 2px solid ${props => props.theme.light};
    border-radius: 5px;
    display: flex;
    padding: 5px 20px;
    align-items: center;
    max-width: 40%;
    margin: 0 -25px 0 0;
    flex-direction: column;
    font-size: 95%;
    max-width: 200px;
    flex-shrink: 0;

    &:hover {
        border: 2px solid ${props => props.theme.secondary};
    }
`;

const OrganizationBanner = () => {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const { observatory, updateCallBack } = useProvenance();
    const user = useSelector(state => state.auth.user);
    const id = useSelector(state => state.comparison.comparisonResource.id);

    const handleChangeProvenance = e => {
        e.preventDefault();
        setShowAssignObservatory(true);
    };

    return (
        <>
            {isEmpty(observatory) && !!user && user.isCurationAllowed && (
                <div className="mt-3">
                    <Button size="sm" outline onClick={() => setShowAssignObservatory(true)}>
                        Assign to observatory
                    </Button>
                </div>
            )}
            {observatory?.organization && (
                <Link
                    to={
                        observatory.id
                            ? reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })
                            : reverse(ROUTES.ORGANIZATION, { id: observatory.organization.display_id })
                    }
                    className="text-center"
                >
                    <OrganizationBannerStyled>
                        {observatory.organization.logo && (
                            <img
                                className="p-2"
                                src={observatory.organization.logo}
                                alt={`${observatory.organization.name} logo`}
                                style={{ maxWidth: 200, maxHeight: 60 }}
                            />
                        )}
                        <div className="d-flex justify-content-center">
                            {observatory?.name && <div>{observatory.name}</div>}
                            {!!user && user.isCurationAllowed && (
                                <div className="ms-2">
                                    <StatementActionButton title="Edit provenance" icon={faPen} action={handleChangeProvenance} />
                                </div>
                            )}
                        </div>
                    </OrganizationBannerStyled>
                </Link>
            )}

            <ObservatoryModal
                callBack={updateCallBack}
                showDialog={showAssignObservatory}
                resourceId={id}
                observatory={!isEmpty(observatory) ? observatory : null}
                organization={!isEmpty(observatory) && !isEmpty(observatory.organization) ? observatory.organization : null}
                toggle={() => setShowAssignObservatory(v => !v)}
            />
        </>
    );
};

export default OrganizationBanner;
