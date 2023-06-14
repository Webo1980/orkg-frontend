import { faSquareMinus, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import arrayMove from 'array-move';
import PropertyPathList from 'components/Comparison/Table/SelectPropertiesModal/PropertyPathList';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button, Input } from 'reactstrap';
import styled from 'styled-components';

const Item = styled.div`
    border: 1px solid #e4e4e4;
    border-radius: 5px;
    padding: 6px 10px;
    margin: 2px 0px 2px 10px;
    flex-grow: 1;
`;

const DragHandle = styled.span`
    cursor: move;
    margin-right: 10px;
    padding: 0 5px;
    opacity: 0.5;
`;

const PropertyPathListItem = ({
    properties,
    setProperties,
    index,
    property,
    expandedPaths,
    expandProperty,
    handleSelectPropertyPath,
    selectedPropertyPaths,
}) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: property.path.slice(0, property.path.length - 1).join('/') || 'root',
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            setProperties(prev => arrayMove(prev, dragIndex, hoverIndex));

            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag, preview] = useDrag({
        type: property.path.slice(0, property.path.length - 1).join('/') || 'root',
        item: { index },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;

    preview(drop(ref));

    const hasChildren = properties.find(
        _property => isEqual(property.path, _property.path.slice(0, property.path.length)) && _property.path.length > property.path.length,
    );

    const isExpanded = expandedPaths.find(_path => isEqual(_path, property.path));
    const isSelected = !!selectedPropertyPaths.find(item => isEqual(item, property.path));
    return (
        <li ref={hasChildren ? ref : null} style={{ opacity }}>
            <div className="d-flex me-2">
                <Button
                    color="link"
                    onClick={() => expandProperty(property.path)}
                    className="p-0 text-secondary"
                    style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                >
                    <Icon icon={isExpanded ? faSquareMinus : faSquarePlus} size="lg" />
                </Button>

                <Item ref={!hasChildren ? ref : null}>
                    <DragHandle ref={drag}>
                        <Icon className="text-secondary" icon={faGripVertical} size="lg" />
                    </DragHandle>
                    <Input type="checkbox" checked={isSelected} onChange={() => handleSelectPropertyPath(property.path)} className="me-3" />
                    <span className={`${!isSelected ? 'text-muted' : ''}`}>{property.label}</span>
                </Item>
            </div>
            {isExpanded && (
                <PropertyPathList
                    properties={properties}
                    setProperties={setProperties}
                    path={property.path}
                    expandedPaths={expandedPaths}
                    expandProperty={expandProperty}
                    handleSelectPropertyPath={handleSelectPropertyPath}
                    selectedPropertyPaths={selectedPropertyPaths}
                />
            )}
        </li>
    );
};

PropertyPathListItem.propTypes = {
    properties: PropTypes.array.isRequired,
    setProperties: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    property: PropTypes.object.isRequired,
    expandedPaths: PropTypes.array.isRequired,
    expandProperty: PropTypes.func.isRequired,
    handleSelectPropertyPath: PropTypes.func.isRequired,
    selectedPropertyPaths: PropTypes.array.isRequired,
};

export default PropertyPathListItem;
