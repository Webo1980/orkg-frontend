import React, { useState } from 'react';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItemContainer';
import AddValue from 'components/StatementBrowser/AddValue/AddValueContainer';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { customStyles, StyledStatementItemValueDropZoneHelper } from './style';
import DndTypes from 'constants/DndTypes';
import { useDrop } from 'react-dnd';
import capitalize from 'capitalize';
import AsyncCreatableSelect from 'react-select/async-creatable';

export default function StatementItemTemplate(props) {
    const [disableHover, setDisableHover] = useState(false);

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: DndTypes.VALUE,
        canDrop: () => {
            return true;
        },
        drop: (item, monitor) => {
            if (monitor.didDrop()) {
                return;
            }
            props.dndSelectedValues.map(v => {
                props.createValue({
                    label: v.label,
                    type: 'object',
                    propertyId: props.id,
                    existingResourceId: v.resourceId ? v.resourceId : null,
                    isExistingValue: true
                });

                props.toggleSelectedDndValues({ id: v.id, label: v.label });
                return true;
            });
            return { moved: true };
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            isOverCurrent: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop(),
            itemToDrop: monitor.getItem()
        })
    });

    const propertyOptionsClasses = classNames({
        propertyOptions: true,
        disableHover: disableHover
    });
    return (
        <StatementsGroupStyle className={`${props.inTemplate ? 'inTemplate' : 'noTemplate'}`}>
            <div className={'row no-gutters'}>
                <PropertyStyle className={`col-4 ${props.property.isEditing ? 'editingLabel' : ''}`} tabIndex="0">
                    {!props.property.isEditing ? (
                        <div>
                            <div className={'propertyLabel'}>{props.predicateLabel}</div>
                            {props.enableEdit && (
                                <div className={propertyOptionsClasses}>
                                    <StatementOptionButton
                                        title={'Edit property'}
                                        icon={faPen}
                                        action={() => props.toggleEditPropertyLabel({ id: props.id })}
                                    />
                                    <StatementOptionButton
                                        requireConfirmation={true}
                                        confirmationMessage={'Are you sure to delete?'}
                                        title={'Delete property'}
                                        icon={faTrash}
                                        action={props.handleDeleteStatement}
                                        onVisibilityChange={disable => setDisableHover(disable)}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <InputGroup size="sm">
                                <AsyncCreatableSelect
                                    className="form-control"
                                    loadOptions={props.loadOptions}
                                    styles={customStyles}
                                    autoFocus
                                    getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                                    getOptionValue={({ id }) => id}
                                    defaultOptions={[
                                        {
                                            label: props.predicateLabel,
                                            id: props.property.existingPredicateId
                                        }
                                    ]}
                                    placeholder={props.predicateLabel}
                                    cacheOptions
                                    onChange={(selectedOption, a) => {
                                        props.handleChange(selectedOption, a);
                                        props.toggleEditPropertyLabel({ id: props.id });
                                    }}
                                    onBlur={e => {
                                        props.toggleEditPropertyLabel({ id: props.id });
                                    }}
                                    onKeyDown={e => e.keyCode === 27 && e.target.blur()}
                                />
                            </InputGroup>
                        </div>
                    )}
                </PropertyStyle>
                <ValuesStyle className={'col-8 valuesList'} ref={drop}>
                    <ListGroup flush className="px-3">
                        {props.property.valueIds.map((valueId, index) => {
                            const value = props.values.byId[valueId];
                            return (
                                <ValueItem
                                    value={value}
                                    key={index}
                                    id={valueId}
                                    enableEdit={props.enableEdit}
                                    syncBackend={props.syncBackend}
                                    propertyId={props.id}
                                    openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                    contextStyle="Template"
                                    showHelp={props.showValueHelp && index === 0 ? true : false}
                                />
                            );
                        })}
                        {canDrop && !isOver && (
                            <StyledStatementItemValueDropZoneHelper>
                                <div className={'pt-1 pb-1'}>Drop here to insert data</div>
                            </StyledStatementItemValueDropZoneHelper>
                        )}
                        {isOver && (
                            <>
                                {props.dndSelectedValues.map(p => {
                                    return (
                                        <ValueItemStyle key={`preview${p.id}`} className={'dropView'}>
                                            {capitalize(p.label)}
                                        </ValueItemStyle>
                                    );
                                })}
                            </>
                        )}
                        {!canDrop && !isOver && props.enableEdit && (
                            <AddValue contextStyle="Template" propertyId={props.id} syncBackend={props.syncBackend} />
                        )}
                    </ListGroup>
                </ValuesStyle>
            </div>
        </StatementsGroupStyle>
    );
}

StatementItemTemplate.propTypes = {
    togglePropertyCollapse: PropTypes.func.isRequired,
    property: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string,
    isLastItem: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    loadOptions: PropTypes.func.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    inTemplate: PropTypes.bool,
    showValueHelp: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    handleDeleteStatement: PropTypes.func.isRequired,
    dndSelectedValues: PropTypes.array.isRequired,
    toggleSelectedDndValues: PropTypes.func.isRequired,
    createValue: PropTypes.func.isRequired
};
