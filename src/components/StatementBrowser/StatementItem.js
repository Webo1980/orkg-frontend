import React, { Component } from 'react';
import { ListGroup, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { StyledStatementItem, StyledListGroupOpen, StyledValueItem } from '../AddPaper/Contributions/styled';
import { getResource } from '../../network';
import classNames from 'classnames';
import ValueItem from './Value/ValueItem';
import AddValue from './Value/AddValue';
import DeleteStatement from './DeleteStatement';
import { connect } from 'react-redux';
import { togglePropertyCollapse, createValue } from '../../actions/statementBrowser';
import { toggleSelectedDndValues, resetSelectedDndValues } from '../../actions/addPaper';
import capitalize from 'capitalize';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import DndTypes from './../../constants/DndTypes';
import { compose } from 'redux';

/**
 * Specifies the drop target contract.
 * All methods are optional.
 */
const propertyValuesTarget = {
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
        props.dndSelectedValues.map(p => {
            props.createValue({
                label: p.label,
                type: 'object',
                propertyId: props.selectedProperty,
                existingResourceId: p.id,
            });

            props.toggleSelectedDndValues({ id: p.id, label: p.label });
            return true;
        })
        props.createValue({
            label: item.label,
            type: 'object',
            propertyId: props.selectedProperty,
            existingResourceId: item.id,
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

class StatementItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            predicateLabel: null
        };
    }


    componentDidMount() {
        this.getPredicateLabel();
    }

    componentDidUpdate(prevProps) {
        if (this.props.predicateLabel !== prevProps.predicateLabel) {
            this.getPredicateLabel();
        }
    }

    getPredicateLabel = () => {
        if (this.props.predicateLabel.match(new RegExp('^R[0-9]*$'))) {
            getResource(this.props.predicateLabel)
                .catch((e) => {
                    console.log(e);
                    this.setState({ predicateLabel: this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1) })
                }).then((r) => {
                    this.setState({ predicateLabel: `${r.label.charAt(0).toUpperCase() + r.label.slice(1)} (${this.props.predicateLabel})` })
                })
        } else {
            this.setState({ predicateLabel: this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1) })
        }
    }

    toggleDeleteContribution = () => {
        this.setState((prevState) => ({
            deleteContributionModal: !prevState.deleteContributionModal,
        }));
    };

    render() {
        const isCollapsed = this.props.selectedProperty === this.props.id;

        const listGroupClass = classNames({
            statementActive: isCollapsed,
            statementItem: true,
            selectable: true,
            'rounded-bottom': this.props.isLastItem && !isCollapsed && !this.props.enableEdit,
        });

        const chevronClass = classNames({
            statementItemIcon: true,
            open: isCollapsed,
            'float-right': true,
        });

        const openBoxClass = classNames({
            listGroupOpenBorderBottom: this.props.isLastItem && !this.props.enableEdit,
            'rounded-bottom': this.props.isLastItem && !this.props.enableEdit,
        });

        let valueIds = Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[this.props.id].valueIds : [];

        const { itemToDrop, isOver, connectDropTarget } = this.props

        return (
            <>
                <StyledStatementItem active={isCollapsed} onClick={() => (!this.props.enableSelection) ? this.props.togglePropertyCollapse(this.props.id) : undefined} className={listGroupClass}>
                    {this.props.enableSelection && (
                        <input
                            type="checkbox"
                            className={'mr-2'}
                            checked={this.props.selectedProperties[this.props.id] ? this.props.selectedProperties[this.props.id] : false}
                            onChange={() => this.props.handleSelectionChange('Property', { id: this.props.id, propertyId: this.props.id, label: this.props.predicateLabel, valueIds: valueIds, existingPredicateId: this.props.id })}
                        />)}
                    <span onClick={() => (this.props.enableSelection) ? this.props.togglePropertyCollapse(this.props.id) : undefined}>
                        {this.state.predicateLabel}
                    </span>
                    {valueIds.length === 1 && !isCollapsed ? (
                        <>
                            :{' '}
                            <em className="text-muted" onClick={() => (this.props.enableSelection) ? this.props.togglePropertyCollapse(this.props.id) : undefined}>
                                <ValueItem
                                    label={this.props.values.byId[valueIds[0]].label}
                                    id={valueIds[0]}
                                    type={this.props.values.byId[valueIds[0]].type}
                                    classes={this.props.values.byId[valueIds[0]].classes}
                                    resourceId={this.props.values.byId[valueIds[0]].resourceId}
                                    propertyId={this.props.id}
                                    existingStatement={this.props.values.byId[valueIds[0]].existingStatement}
                                    inline
                                />
                            </em>
                        </>
                    ) : valueIds.length > 1 && !isCollapsed ? (
                        <>
                            : <em className="text-muted" onClick={() => (this.props.enableSelection) ? this.props.togglePropertyCollapse(this.props.id) : undefined}>{valueIds.length} values</em>
                        </>
                    ) : (
                                ''
                            )}
                    <Icon onClick={() => (this.props.enableSelection) ? this.props.togglePropertyCollapse(this.props.id) : undefined} icon={isCollapsed ? faChevronCircleUp : faChevronCircleDown} className={chevronClass} /> {!this.props.isExistingProperty ? <DeleteStatement id={this.props.id} /> : ''}
                </StyledStatementItem>

                <Collapse isOpen={isCollapsed}>
                    <StyledListGroupOpen ref={instance => connectDropTarget(instance)} className={openBoxClass} >
                        <ListGroup flush>
                            {valueIds.map((valueId, index) => {
                                let value = this.props.values.byId[valueId];
                                return (
                                    <ValueItem
                                        key={index}
                                        label={value.label}
                                        id={valueId}
                                        type={value.type}
                                        classes={value.classes}
                                        resourceId={value.resourceId}
                                        propertyId={this.props.id}
                                        existingStatement={value.existingStatement}
                                        openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                        enableSelection={this.props.enableSelection}
                                        handleSelectionChange={this.props.handleSelectionChange}
                                        selectedProperties={this.props.selectedProperties}
                                        selectedValues={this.props.selectedValues}
                                    />
                                );
                            })}

                            {isOver && (
                                <>
                                    {this.props.dndSelectedValues.map(p => {
                                        return (
                                            <StyledStatementItem
                                                className={'dropView'}
                                            >
                                                {capitalize(p.label)}
                                            </StyledStatementItem>
                                        )
                                    })}
                                </>
                            )}
                            {this.props.enableEdit ? <AddValue /> : ''}
                        </ListGroup>
                    </StyledListGroupOpen>
                </Collapse>
            </>
        );
    }
}

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isExistingProperty: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    enableSelection: PropTypes.bool,
    handleSelectionChange: PropTypes.func,
    selectedValues: PropTypes.object,
    selectedProperties: PropTypes.object,
    isLastItem: PropTypes.bool.isRequired,
    togglePropertyCollapse: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    createValue: PropTypes.func.isRequired,
    itemToDrop: PropTypes.object,
    isOver: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    dndSelectedProperties: PropTypes.array.isRequired,
    dndSelectedValues: PropTypes.array.isRequired,
    toggleSelectedDndValues: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        dndSelectedProperties: state.addPaper.dndSelectedProperties,
        dndSelectedValues: state.addPaper.dndSelectedValues,
    };
};

const mapDispatchToProps = (dispatch) => ({
    togglePropertyCollapse: (id) => dispatch(togglePropertyCollapse(id)),
    createValue: (data) => dispatch(createValue(data)),
    toggleSelectedDndValues: (data) => dispatch(toggleSelectedDndValues(data)),
    resetSelectedDndValues: () => dispatch(resetSelectedDndValues()),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    DropTarget(DndTypes.VALUE, propertyValuesTarget, collect)
)(StatementItem);