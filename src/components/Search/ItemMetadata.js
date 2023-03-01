import { faArrowRight, faCalendar, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import CreatedByBadge from 'components/Badges/CreatedByBadge/CreatedByBadge';
import CopyId from 'components/CopyId/CopyId';
import ProvenanceBox from 'components/Resource/ProvenanceBox';
import moment from 'moment';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';

const ItemMetadata = ({ item, showClasses, showCreatedAt, showCreatedBy, showProvenance, editMode }) => (
    <div className="d-flex">
        <div className="flex-grow-1">
            {showCreatedAt && (
                <Badge color="light" className="me-2">
                    <Icon size="sm" icon={faCalendar} className="me-1" /> {moment(item.created_at).format('DD MMMM YYYY - H:mm')}
                </Badge>
            )}
            {item.shared > 0 && (
                <Badge color="light" className="me-2">
                    <span>
                        <Icon icon={faArrowRight} />
                    </span>
                    {` Referred ${pluralize('time', item.shared, true)}`}
                </Badge>
            )}
            {showClasses && item.classes?.length > 0 && (
                <Badge color="light" className="me-2">
                    <span>
                        <Icon icon={faTags} /> {' Instance of '}
                    </span>
                    {item.classes.join(', ')}
                </Badge>
            )}
            {showCreatedBy && <CreatedByBadge creator={item.created_by} />}
            {showProvenance && (
                <span className="d-inline-block">
                    <ProvenanceBox item={item} editMode={editMode} />
                </span>
            )}
        </div>
        <div className="d-flex align-items-end flex-shrink-0">
            <CopyId id={item.id} />
        </div>
    </div>
);

ItemMetadata.propTypes = {
    item: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
    showClasses: PropTypes.bool,
    showCreatedAt: PropTypes.bool,
    showCreatedBy: PropTypes.bool,
    showProvenance: PropTypes.bool,
};

ItemMetadata.defaultProps = {
    editMode: false,
    showClasses: false,
    showCreatedAt: false,
    showCreatedBy: false,
    showProvenance: false,
};

export default ItemMetadata;
