import { faPen, faStar, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { AuthorTag } from 'components/Input/AuthorsInput/styled';
import PropTypes from 'prop-types';

const FilterItem = ({ filter, editFilter, removeFilter }) => (
    <AuthorTag>
        <div className="ms-3 me-1 align-self-center">
            <Icon icon={faStar} color={filter.featured ? '#e86161' : undefined} />
        </div>
        <div
            className="name"
            onClick={() => editFilter(filter)}
            onKeyDown={e => (e.key === 'Enter' ? editFilter(filter) : undefined)}
            role="button"
            tabIndex={0}
        >
            {filter.label}
        </div>

        <div
            style={{ padding: '8px' }}
            onClick={() => editFilter(filter)}
            onKeyDown={e => (e.key === 'Enter' ? editFilter(filter) : undefined)}
            role="button"
            tabIndex={0}
        >
            <Icon icon={faPen} />
        </div>
        <div
            title="Delete filter"
            className="delete"
            onClick={() => removeFilter(filter)}
            onKeyDown={e => (e.key === 'Enter' ? removeFilter(filter) : undefined)}
            role="button"
            tabIndex={0}
        >
            <Icon icon={faTimes} />
        </div>
    </AuthorTag>
);

FilterItem.propTypes = {
    filter: PropTypes.object.isRequired,
    editFilter: PropTypes.func,
    removeFilter: PropTypes.func,
};

export default FilterItem;
