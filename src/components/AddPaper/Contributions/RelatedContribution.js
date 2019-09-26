import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import DndTypes from '../../../constants/DndTypes';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEye } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const StyledRelatedContribution = styled.li`
    position: relative;
    padding-bottom: 20px;

    &.dragging{
        opacity: 0.5;
    }
    .cardBody{
        cursor: move;
        padding: 9px 9px 9px 15px;
    }
    .cardFooter{
        padding: 2px 10px;
        font-size:small;
        position:absolute;
        bottom: 0;
        left: 0;
        right: 0;
        border-top: 1px solid ${props => props.theme.bodyBg};
        border-bottom-left-radius: ${props => props.theme.borderRadius};
        border-bottom-right-radius: ${props => props.theme.borderRadius};

        .previewButton{
            float:right;
            cursor:pointer;
        }
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
        connectDragPreview: connect.dragPreview(),
        // You can ask the monitor about the current drag state:
        isDragging: monitor.isDragging(),
    }
}

class RelatedContribution extends Component {
    render() {
        const { id, label, authors, contributions, isDragging, connectDragSource, connectDragPreview } = this.props
        return (
            <StyledRelatedContribution className={isDragging ? 'dragging' : ''} ref={instance => connectDragPreview(instance)}>
                <div className={'cardBody'} ref={instance => connectDragSource(instance)} >
                    <Icon icon={faEllipsisV} className={'mr-2'} />
                    {label}
                </div>
                {/*<Icon icon={faEye} size="xs" stlye={{ cursor: 'default', float: 'right' }} />*/}
                <div className={'cardFooter'}>
                    {authors[0]}
                    <div onClick={() => this.props.openDialog(contributions[0].id, label)} className={'previewButton'}><Icon icon={faEye} size="xs" /> Details </div>
                </div>
            </StyledRelatedContribution>
        )
    }
}

RelatedContribution.propTypes = {
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    contributions: PropTypes.array.isRequired,
    authors: PropTypes.array.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    openDialog: PropTypes.func.isRequired
};

export default DragSource(DndTypes.CONTRIBUTION, cardSource, collect)(RelatedContribution)
