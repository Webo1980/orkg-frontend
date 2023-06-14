import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeContribution } from 'slices/comparisonSlice';
import { Contribution, Delete } from 'components/Comparison/styled';
import { memo, useState } from 'react';
import { isEqual } from 'lodash';
import { Button } from 'reactstrap';
import StatementBrowser from 'components/Comparison/Table/Cells/StatementBrowser';

const ContributionCell = ({ contribution }) => {
    const dispatch = useDispatch();
    const contributions = useSelector(state => state.comparison.contributions);
    const isEditing = useSelector(state => state.comparison.isEditing);
    const isEmbeddedMode = useSelector(state => state.comparison.isEmbeddedMode);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);

    const [isOpenModal, setIsOpenModal] = useState(false);

    return (
        <>
            <div>
                <Link
                    to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                        resourceId: contribution.paperId,
                        contributionId: contribution.id,
                    })}
                >
                    {contribution.title ? contribution.title : <em>No title</em>}
                </Link>
                <br />
                <Contribution>
                    {contribution.contributionLabel} {contribution.year && `- ${contribution.year}`}
                </Contribution>

                {isEditing && !isEmbeddedMode && contributions.filter(_contribution => _contribution.active).length > 2 && (
                    <Delete onClick={() => dispatch(removeContribution(contribution.id))}>
                        <Icon icon={faTimes} />
                    </Delete>
                )}
            </div>
            {isEditing && comparisonType === 'property-path' && (
                <div className="mt-1 pt-1" style={{ borderTop: 'thin solid #d75050' }}>
                    <Button color="primary-darker" size="sm" onClick={() => setIsOpenModal(true)}>
                        Statement browser
                    </Button>
                </div>
            )}
            {isOpenModal && (
                <StatementBrowser
                    entity={{ resourceId: contribution.id, label: contribution.contributionLabel, pathLabels: [] }}
                    toggle={() => setIsOpenModal(v => !v)}
                />
            )}
        </>
    );
};

ContributionCell.propTypes = {
    contribution: PropTypes.object.isRequired,
};

export default memo(ContributionCell, isEqual);
