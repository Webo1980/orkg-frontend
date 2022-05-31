import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import { CardBadge } from 'components/styled';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import moment from 'moment';
import { CLASSES } from 'constants/graphSettings';

const DatasetCardStyled = styled.div`
    a {
        cursor: pointer !important;
        &:hover {
            cursor: pointer !important;
            text-decoration: none;
        }
    }
`;

const DatasetCard = props => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.dataset.id,
        unlisted: props.dataset?.unlisted,
        featured: props.dataset?.featured
    });

    return (
        <DatasetCardStyled className={`list-group-item d-flex py-3 pe-4 ${props.showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
                {props.showCurationFlags && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        <div>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        </div>
                        <div>
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </div>
                    </div>
                )}
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        <Link to={props.dataset.id && reverse(ROUTES.CONTENT_TYPE_NO_MODE, { type: CLASSES.DATASET, id: props.dataset.id })}>
                            {props.dataset.label ? props.dataset.label : <em>No title</em>}
                        </Link>
                        {props.showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Dataset</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            {props.dataset.authors && props.dataset.authors.length > 0 && (
                                <>
                                    <Icon size="sm" icon={faUser} /> {props.dataset.authors.map(a => a.label).join(', ')}
                                </>
                            )}
                            {props.dataset.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ms-2 me-1" /> {moment(props.dataset.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {props.dataset.description && (
                        <div>
                            <small className="text-muted">{props.dataset.description}</small>
                        </div>
                    )}
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                    <UserAvatar userId={props.dataset.created_by} />
                </div>
            </div>
        </DatasetCardStyled>
    );
};

DatasetCard.propTypes = {
    dataset: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        authors: PropTypes.array,
        created_at: PropTypes.string,
        created_by: PropTypes.string,
        description: PropTypes.string,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool
    }).isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired
};

DatasetCard.defaultProps = {
    showBadge: false,
    showCurationFlags: true
};

export default DatasetCard;
