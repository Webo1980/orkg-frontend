import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import DndTypes from '../../../constants/DndTypes';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledRelatedValue = styled.li`
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
        //console.log('DROPPED!');
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

class RelatedValue extends Component {
    render() {
        const { label, isDragging, connectDragSource } = this.props
        return (
            <StyledRelatedValue className={isDragging ? 'dragging' : ''} ref={instance => connectDragSource(instance)}>
                {label}
            </StyledRelatedValue>
        )
    }
}

RelatedValue.propTypes = {
    isDragging: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    connectDragSource: PropTypes.func.isRequired
};

export default DragSource(DndTypes.VALUE, cardSource, collect)(RelatedValue)
