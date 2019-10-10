import React, { Component } from 'react';
import { ListGroup, Button } from 'reactstrap';
import { StyledLevelBox, StyledStatementItem, StyledStatementItemDropZoneHelper } from '../AddPaper/Contributions/styled';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';
import { connect } from 'react-redux';
import Breadcrumbs from './Breadcrumbs';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { initializeWithoutContribution, createProperty, createValue } from '../../actions/statementBrowser';
import { prefillStatements, toggleSelectedDndProperties, resetSelectedDndProperties } from '../../actions/addPaper';
import { DropTarget } from 'react-dnd';
import DndTypes from './../../constants/DndTypes';
import capitalize from 'capitalize';
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

        if (monitor.getItemType() === DndTypes.CONTRIBUTION) {
            // copy template
            if (item.contribution) {
                props.prefillStatements({
                    statements: item.contribution.statements,
                    resourceId: props.selectedResource,
                });
            }
        }
        if (monitor.getItemType() === DndTypes.PROPERTY) {
            props.dndSelectedProperties.map(p => {
                props.createProperty({
                    resourceId: props.selectedResource,
                    existingPredicateId: p.id,
                    label: p.label,
                });
                props.toggleSelectedDndProperties({ id: p.id, label: p.label });
                return true;
            })
            props.resetSelectedDndProperties();
        }

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
        itemToDropType: monitor.getItemType(),
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

        this.state = {
            selectedProperties: {},
            selectedValues: {},
        };
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleSelectionChange = (itemType, item) => {
        if (itemType === 'Property') {
            let values = this.state.selectedValues;
            if (!this.state.selectedProperties[item.id]) {
                // add values
                for (var id of item.valueIds) {
                    let v = this.props.values.byId[id];
                    values[id] = { id: v.resourceId, label: v.label, propertyId: item.propertyId, type: v.type, isExistingValue: true };
                }
            } else {
                // removes values
                for (var value of item.valueIds) {
                    delete values[value];
                }
            }
            this.setState({
                selectedProperties: {
                    ...this.state.selectedProperties,
                    [item.id]: this.state.selectedProperties[item.id]
                        ? undefined
                        : { label: item.label, existingPredicateId: item.existingPredicateId, propertyId: item.propertyId, valueIds: Object.keys(values) }
                },
                selectedValues: values
            })
        }
        if (itemType === 'Value') {
            let vl = this.state.selectedValues;
            let pr = this.state.selectedProperties;
            if (pr[item.propertyId] && pr[item.propertyId].valueIds.includes(item.id)) {
                let newValueIds = pr[item.propertyId].valueIds.filter(i => i !== item.id);
                let newPropertyObject = { ...pr[item.propertyId], valueIds: newValueIds }
                pr = { ...pr, [item.propertyId]: newPropertyObject }
                //remove value
                delete vl[item.id];
                this.setState({
                    selectedProperties: pr,
                    selectedValues: vl
                })
            } else {
                if (!pr[item.propertyId]) {
                    let cpr = this.props.properties.byId[item.propertyId]; //copy
                    pr[item.propertyId] = { label: cpr.label, existingPredicateId: cpr.existingPredicateId, propertyId: item.propertyId, valueIds: [] };
                }
                pr[item.propertyId].valueIds.push(item.id)
                let newPropertyObject = { ...pr[item.propertyId], valueIds: pr[item.propertyId].valueIds }
                pr = { ...pr, [item.propertyId]: newPropertyObject };
                //add value
                vl[item.id] = { id: item.resourceId, label: item.label, propertyId: item.propertyId, type: item.type, isExistingValue: true };
                this.setState({
                    selectedProperties: pr,
                    selectedValues: vl
                })
            }
        }
    }

    disableAddToContributionButton = () => {
        for (var key in this.state.selectedProperties) {
            if (this.state.selectedProperties[key] !== null && this.state.selectedProperties[key] !== '' && this.state.selectedProperties[key] !== undefined) {
                return false;
            }
        }
        return true;
    }

    statements = () => {
        const { itemToDrop, itemToDropType, isOver, canDrop, connectDropTarget } = this.props

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
                                            enableSelection={this.props.enableSelection}
                                            selectedProperties={this.state.selectedProperties}
                                            selectedValues={this.state.selectedValues}
                                            handleSelectionChange={this.handleSelectionChange}
                                            isLastItem={propertyIds.length === index + 1}
                                            openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                        />
                                    )
                                })}
                                {((propertyIds.length > 0) && canDrop && !isOver) && (
                                    <StyledStatementItemDropZoneHelper>
                                        <div className={'pt-3 pb-3'}>
                                            Drop here to insert data
                                        </div>
                                    </StyledStatementItemDropZoneHelper>)
                                }
                                {isOver && (
                                    <>
                                        {itemToDropType === DndTypes.PROPERTY && (
                                            <>
                                                {this.props.dndSelectedProperties.map(p => {
                                                    return (
                                                        <StyledStatementItem
                                                            key={p.id}
                                                            className={'dropView'}
                                                        >
                                                            {capitalize(p.label)}
                                                        </StyledStatementItem>
                                                    )
                                                })}
                                            </>
                                        )}
                                        {itemToDropType === DndTypes.CONTRIBUTION && itemToDrop.contribution && (
                                            <>
                                                {itemToDrop.contribution.statements.properties.map(p => {
                                                    return (
                                                        <StyledStatementItem
                                                            key={p.id}
                                                            className={'dropView'}
                                                        >
                                                            {capitalize(p.label)}
                                                        </StyledStatementItem>
                                                    )
                                                })}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )
                            : (this.props.enableEdit) ? (
                                <StyledStatementItemDropZoneHelper>
                                    {canDrop && (
                                        <div className={'pt-3 pb-3'}>
                                            Drop here to insert data
                                        </div>)
                                    }
                                    {!canDrop && (
                                        <>
                                            No data yet!<br /><small>Start by creating properties or dropping similar contribution data from the right side.</small><br />
                                            <small>The data is entered in a <b>property</b> and <b>value</b> structure.</small><br /><br />
                                            <img src={require('../../assets/img/dataStructure.png')} alt="" className="img-responsive" /><br />
                                        </>)
                                    }
                                </StyledStatementItemDropZoneHelper>
                            ) : (<StyledStatementItem>No values</StyledStatementItem>)
                    ) : (
                            <StyledStatementItem>
                                <Icon icon={faSpinner} spin /> Loading
                            </StyledStatementItem>
                        )}

                    {this.props.enableEdit ? <AddStatement /> : ''}
                </ListGroup>
            </div >
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

                {this.props.enableSelection && (
                    <div className={'mt-4 text-center'}>
                        <Button
                            disabled={this.disableAddToContributionButton()}
                            onClick={() => this.props.selectedAction({ properties: this.state.selectedProperties, values: this.state.selectedValues })}
                        >
                            Add to contribution data
                        </Button>
                    </div>
                )}
            </>
        );
    }
}

Statements.propTypes = {
    level: PropTypes.number.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    isFetchingStatements: PropTypes.bool.isRequired,
    selectedResource: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    initializeWithoutContribution: PropTypes.func.isRequired,
    initialResourceId: PropTypes.string,
    initialResourceLabel: PropTypes.string,
    openExistingResourcesInDialog: PropTypes.bool,
    createProperty: PropTypes.func.isRequired,
    createValue: PropTypes.func.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    itemToDrop: PropTypes.object,
    itemToDropType: PropTypes.string,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    enableSelection: PropTypes.bool,
    selectedAction: PropTypes.func,
    dndSelectedProperties: PropTypes.array.isRequired,
    dndSelectedValues: PropTypes.array.isRequired,
    toggleSelectedDndProperties: PropTypes.func.isRequired,
    resetSelectedDndProperties: PropTypes.func.isRequired,
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
        values: state.statementBrowser.values,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource,
        dndSelectedProperties: state.addPaper.dndSelectedProperties,
        dndSelectedValues: state.addPaper.dndSelectedValues,
    }
};

const mapDispatchToProps = dispatch => ({
    initializeWithoutContribution: (data) => dispatch(initializeWithoutContribution(data)),
    createProperty: (data) => dispatch(createProperty(data)),
    createValue: (data) => dispatch(createValue(data)),
    prefillStatements: (data) => dispatch(prefillStatements(data)),
    toggleSelectedDndProperties: (data) => dispatch(toggleSelectedDndProperties(data)),
    resetSelectedDndProperties: () => dispatch(resetSelectedDndProperties()),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    DropTarget([DndTypes.PROPERTY, DndTypes.CONTRIBUTION], chessSquareTarget, collect)
)(Statements);