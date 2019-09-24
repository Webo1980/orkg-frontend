import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import DndTypes from '../../../constants/DndTypes';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEye } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const StyledRelatedContribution = styled.li`
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
        const item = { id: props.id, label: props.label, contributions: props.contributions }
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

class RelatedContribution extends Component {
    render() {
        const { label, contributions, isDragging, connectDragSource } = this.props
        return (
            <StyledRelatedContribution className={isDragging ? 'dragging' : ''} ref={instance => connectDragSource(instance)}>
                <Icon icon={faEllipsisV} className={'mr-2'} />
                {label} {contributions.length > 0 && `${contributions[0].statements.properties.length}P / ${contributions[0].statements.values.length}V`}
                {/*<Icon icon={faEye} size="xs" stlye={{ cursor: 'default', float: 'right' }} />*/}
            </StyledRelatedContribution>
        )
    }
}

RelatedContribution.propTypes = {
    isDragging: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    contributions: PropTypes.array.isRequired,
    connectDragSource: PropTypes.func.isRequired
};

export default DragSource(DndTypes.CONTRIBUTION, cardSource, collect)(RelatedContribution)
