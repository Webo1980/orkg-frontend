import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import DndTypes from '../../../constants/DndTypes';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const StyledRelatedProperty = styled.li`
    position: relative; 
    cursor: move;
    margin-bottom: 8px ; 
    transition: 0.3s background;
    border: dotted 1px;
    border-radius: ${props => props.theme.borderRadius};
    box-shadow: -2px 0px 2px 0px rgba(0, 0, 0, 0.1);
    padding: 9px 9px 9px 15px;

    font-size: small;
    
    &.selected{
        background: #c2dbff;
    }

    &.dragging{
        opacity: 0.5;
    }
`;

/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
const cardSource = {
    beginDrag(props) {
        // Return the data describing the dragged item
        const item = { id: props.id, label: props.label }
        return item
    },

    endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {
            return
        }

        // When dropped on a compatible target, do something
        props.dropped(monitor.getItem().id)
    },
}

/**
* Specifies which props to inject into your component.
*/
function collect(connect, monitor) {
    return {
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDragSource: connect.dragSource(),
        // You can ask the monitor about the current drag state:
        isDragging: monitor.isDragging(),
    }
}

class RelatedProperty extends Component {
    render() {
        const { id, label, isDragging, connectDragSource } = this.props
        return (
            <StyledRelatedProperty
                onClick={() => this.props.toggleSelect({ id, label })}
                className={classnames({ dragging: isDragging, selected: this.props.selected })}
                ref={instance => connectDragSource(instance)}
            >
                <Icon icon={faGripVertical} color={'#cbcece'} className={'mr-2'} />
                {label}
            </StyledRelatedProperty>
        )
    }
}

RelatedProperty.propTypes = {
    id: PropTypes.string.isRequired,
    isDragging: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    toggleSelect: PropTypes.func
};

export default DragSource(DndTypes.PROPERTY, cardSource, collect)(RelatedProperty)
