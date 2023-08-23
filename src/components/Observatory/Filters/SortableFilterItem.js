import { faPen, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { AuthorTag, StyledDragHandle } from 'components/Input/AuthorsInput/styled';
import ItemTypes from 'constants/dndTypes';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { handleSortableHoverReactDnd } from 'utils';

const SortableFilterItem = ({ filter, filterIndex, editFilter, removeFilter, handleUpdate }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: ItemTypes.AUTHOR_TAG,
        hover: (item, monitor) => handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: filterIndex, handleUpdate }),
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.AUTHOR_TAG,
        item: { index: filterIndex },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => true,
    });

    const opacity = isDragging ? 0.4 : 1;

    preview(drop(ref));

    return (
        <AuthorTag ref={ref} style={{ opacity }}>
            <StyledDragHandle className="ms-2 me-2" ref={drag}>
                <Icon icon={faSort} />
            </StyledDragHandle>
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
};

SortableFilterItem.propTypes = {
    filter: PropTypes.object.isRequired,
    filterIndex: PropTypes.number.isRequired,
    editFilter: PropTypes.func,
    removeFilter: PropTypes.func,
    handleUpdate: PropTypes.func,
};

export default SortableFilterItem;
