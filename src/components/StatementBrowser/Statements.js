import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import { StyledLevelBox, StyledStatementItem } from '../AddPaper/Contributions/styled';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';
import { connect } from 'react-redux';
import Breadcrumbs from './Breadcrumbs';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { initializeWithoutContribution, createProperty } from '../../actions/statementBrowser';
import { DropTarget } from 'react-dnd';
import DndTypes from './../../constants/DndTypes';
import { compose } from 'redux';

/**
 * Specifies the drop target contract.
 * All methods are optional.
 */
const chessSquareTarget = {
    canDrop(props, monitor) {
        // You can disallow drop based on props or item
        //const item = monitor.getItem()
        return true;
    },

    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            // If you want, you can check whether some nested
            // target already handled drop
            return
        }

        // Obtain the dragged item
        const item = monitor.getItem()

        // You can do something with it
        //ChessActions.movePiece(item.fromPosition, props.position)

        props.createProperty({
            resourceId: props.selectedResource,
            label: item.label,
        });

        // You can also do nothing and return a drop result,
        // which will be available as monitor.getDropResult()
        // in the drag source's endDrag() method
        return { moved: true }
    },
}


/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDropTarget: connect.dropTarget(),
        // You can ask the monitor about the current drag state:
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        itemToDrop: monitor.getItem(),
    }
}

class Statements extends Component {
    constructor(props) {
        super(props);

        if (this.props.initialResourceId) {
            this.props.initializeWithoutContribution({
                resourceId: this.props.initialResourceId,
                label: this.props.initialResourceLabel,
            })
        }
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    statements = () => {
        const { itemToDrop, isOver, connectDropTarget } = this.props

        let propertyIds = Object.keys(this.props.resources.byId).length !== 0 && this.props.selectedResource ? this.props.resources.byId[this.props.selectedResource].propertyIds : [];

        return connectDropTarget(
            <div>
                <ListGroup
                    className={'listGroupEnlarge'}

                >
                    {!this.props.isFetchingStatements ? (
                        ((propertyIds.length > 0) || isOver) ? (
                            <>
                                {propertyIds.map((propertyId, index) => {
                                    let property = this.props.properties.byId[propertyId];

                                    return (
                                        <StatementItem
                                            id={propertyId}
                                            predicateLabel={property.label}
                                            key={'statement-' + index}
                                            index={index}
                                            isExistingProperty={property.isExistingProperty ? true : false}
                                            enableEdit={this.props.enableEdit}
                                            isLastItem={propertyIds.length === index + 1}
                                            openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                        />
                                    )
                                })}
                                {isOver &&
                                    <StyledStatementItem
                                        style={{ background: '#e9ebf2', opacity: 0.5 }}
                                    >{itemToDrop.label}
                                    </StyledStatementItem>
                                }
                            </>
                        )
                            : <StyledStatementItem>No values</StyledStatementItem>
                    ) : (
                            <StyledStatementItem>
                                <Icon icon={faSpinner} spin /> Loading
                            </StyledStatementItem>
                        )}

                    {this.props.enableEdit ? <AddStatement /> : ''}
                </ListGroup>
            </div>
        );
    }

    addLevel = (level, maxLevel) => {
        return maxLevel !== 0 ? (
            <StyledLevelBox>
                {maxLevel !== level + 1 && this.addLevel(level + 1, maxLevel)}
                {maxLevel === level + 1 && this.statements()}
            </StyledLevelBox>
        ) : this.statements();
    }

    render() {
        let elements = this.addLevel(0, this.props.level);

        return (
            <>
                {this.props.level !== 0 ? (
                    <>
                        <Breadcrumbs />
                    </>
                ) : ''}

                {elements}
            </>
        );
    }
}

Statements.propTypes = {
    level: PropTypes.number.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    isFetchingStatements: PropTypes.bool.isRequired,
    selectedResource: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    initializeWithoutContribution: PropTypes.func.isRequired,
    initialResourceId: PropTypes.string,
    initialResourceLabel: PropTypes.string,
    openExistingResourcesInDialog: PropTypes.bool,
    createProperty: PropTypes.func.isRequired,
    itemToDrop: PropTypes.object,
    isOver: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
};

Statements.defaultProps = {
    openExistingResourcesInDialog: false,
    initialResourceId: null,
    initialResourceLabel: null,
};

const mapStateToProps = state => {
    return {
        level: state.statementBrowser.level,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource,
    }
};

const mapDispatchToProps = dispatch => ({
    initializeWithoutContribution: (data) => dispatch(initializeWithoutContribution(data)),
    createProperty: (data) => dispatch(createProperty(data)),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    DropTarget(DndTypes.PROPERTY, chessSquareTarget, collect)
)(Statements);