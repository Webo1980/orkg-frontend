import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import DndTypes from '../../../constants/DndTypes';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleSelectedDndValues, pushToSelectedDndValues } from '../../../actions/addPaper';
import { createDragPreview } from 'react-dnd-text-dragpreview'
import { compose } from 'redux';
import classnames from 'classnames';

const StyledRelatedValue = styled.li`
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

    & .dragIcon{
        visibility:hidden;
    }

    &:hover .dragIcon{
        visibility:visible;
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
        props.pushToSelected(item)
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

// overrides dragPreview style
var dragPreviewStyle = {
    backgroundColor: '#6c7289',
    borderColor: '#E86161',
    color: '#fff',
    fontSize: 15,
    paddingTop: 7,
    paddingRight: 7,
    paddingBottom: 7,
    paddingLeft: 7
}


class RelatedValue extends Component {

    componentDidMount() {
        // handles first time dragPreview setup
        this.dragPreview = createDragPreview(this.formatDragMessage(this.props.selected.length), dragPreviewStyle)
        this.props.connectDragPreview(this.dragPreview)
    }
    componentDidUpdate() {
        // handles updates to the dragPreview image as the dynamic numRows value changes
        this.dragPreview = createDragPreview(this.formatDragMessage(this.props.selected.length), dragPreviewStyle, this.dragPreview)
    }

    // provides custom message for dragPreview
    formatDragMessage = (numRows) => {
        if (this.props.selected.some(c => c.id === this.props.id)) {
            const noun = numRows === 1 ? 'value' : 'values'
            return `Moving ${numRows} ${noun}`
        } else {
            const noun = (numRows + 1) === 1 ? 'value' : 'values'
            return `Moving ${numRows + 1} ${noun}`
        }
    }

    render() {
        const { id, label, isDragging, connectDragSource } = this.props
        return (
            <StyledRelatedValue
                onClick={() => this.props.toggleSelect({ id, label })}
                className={classnames({ dragging: isDragging, selected: this.props.selected.some(c => c.id === id) })}
                ref={instance => connectDragSource(instance)}
            >
                <Icon icon={faGripVertical} color={'#cbcece'} className={'dragIcon mr-2'} />
                {label}
            </StyledRelatedValue>
        )
    }
}

RelatedValue.propTypes = {
    id: PropTypes.string.isRequired,
    isDragging: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    selected: PropTypes.array.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    toggleSelect: PropTypes.func.isRequired,
    pushToSelected: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        selected: state.addPaper.dndSelectedValues,
    }
};

const mapDispatchToProps = dispatch => ({
    toggleSelect: (data) => dispatch(toggleSelectedDndValues(data)),
    pushToSelected: (data) => dispatch(pushToSelectedDndValues(data)),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    DragSource(DndTypes.VALUE, cardSource, collect),
)(RelatedValue);