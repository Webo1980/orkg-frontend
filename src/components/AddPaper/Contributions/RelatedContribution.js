import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import DndTypes from '../../../constants/DndTypes';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTasks } from '@fortawesome/free-solid-svg-icons';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const StyledRelatedContribution = styled.li`
    position: relative;
    margin-bottom: 8px ; 
    transition: 0.3s background;
    border: dotted 1px;
    border-radius: ${props => props.theme.borderRadius};
    box-shadow: -2px 0px 2px 0px rgba(0, 0, 0, 0.1);

    vertical-align: middle;
    -webkit-transform: perspective(1px) translateZ(0);
    transform: perspective(1px) translateZ(0);
    overflow: hidden;
    -webkit-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -webkit-transition-property: color, background-color;
    transition-property: color, background-color;

    &.dragging{
        opacity: 0.5;
        background-color: #c2dbffe0;
    }

    &:hover .cardBody .dragIcon{
        visibility:visible;
    }

    .cardBody{
        font-size: small;
        cursor: move;
        padding: 9px 9px 9px 9px;

        & .dragIcon{
            visibility:hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    &:active{
        background-color: #c2dbffe0;
    }

    & .previewButton{
        display:none;
        float:right;
        cursor:pointer;
    }

    &:hover .previewButton{
        float:right;
        display:block;
    }
`;

/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
const cardSource = {
    beginDrag(props, monitor, component) {
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
        const { label, authors, contributions, isDragging, connectDragSource, connectDragPreview } = this.props
        return (
            <StyledRelatedContribution
                className={classnames({ dragging: isDragging })}
                ref={instance => connectDragPreview(instance)}
            >
                <div className={'cardBody d-flex'} ref={instance => connectDragSource(instance)} >
                    <div className={'dragIcon mr-2'}>
                        <Icon icon={faGripVertical} color={'#cbcece'} />
                    </div>
                    <div>
                        {label} <br /><br />
                        <i>{authors[0]}</i>
                        <div onClick={() => this.props.openDialog(contributions[0].id, label)} className={'previewButton'}>
                            <Icon icon={faTasks} /> Select data
                        </div>
                    </div>
                </div>
                {/*<Icon icon={faEye} size="xs" stlye={{ cursor: 'default', float: 'right' }} />*/}
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
    openDialog: PropTypes.func.isRequired,
};

export default DragSource(DndTypes.CONTRIBUTION, cardSource, collect)(RelatedContribution)
