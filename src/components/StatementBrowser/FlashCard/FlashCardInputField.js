import Tippy from '@tippyjs/react';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import useAddValue from 'components/StatementBrowser/AddValue/hooks/useAddValue';
import { StyledButton } from 'components/StatementBrowser/styled';
import { getConfigByClassId } from 'constants/DataTypes';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input, InputGroup } from 'reactstrap';
import { deleteStatementById } from 'services/backend/statements';
import {
    deleteValue,
    getPropertyIdByByResourceAndPredicateId,
    getPropertyShapesByResourceIDAndPredicateID,
    getValuesByByResourceAndPredicateId,
} from 'slices/statementBrowserSlice';

const FlashCardInputField = ({ resourceId, predicateId }) => {
    const propertyShape = useSelector(state => getPropertyShapesByResourceIDAndPredicateID(state, resourceId, predicateId));
    const propertyId = useSelector(state => getPropertyIdByByResourceAndPredicateId(state, resourceId, predicateId));
    const valuesIds = useSelector(state => getValuesByByResourceAndPredicateId(state, resourceId, predicateId));
    const value = useSelector(state => (valuesIds?.length > 0 ? state.statementBrowser.values.byId[valuesIds[0]] : null));
    const { handleAddValue } = useAddValue({
        resourceId,
        propertyId,
        syncBackend: true,
    });
    const [inputValue, setInputValue] = useState(value ? value.label : null);
    const [isSaving, setIsSaving] = useState(false);

    const [focused, setFocused] = useState(false);
    const onFocus = () => setFocused(true);
    const onBlur = () => {
        setTimeout(() => {
            setFocused(false);
        }, 500);
    };
    const dispatch = useDispatch();
    const range = propertyShape?.[0]?.value;
    const placeholder = propertyShape?.[0]?.placeholder;
    const description = propertyShape?.[0]?.description;

    let inputFormType;
    const config = getConfigByClassId(range?.id);
    inputFormType = config.inputFormType;
    if (CLASSES.STRING === range?.id) {
        inputFormType = 'text';
    }

    if (propertyShape.length === 0) {
        return null;
    }

    const updateValue = async _value => {
        setIsSaving(true);
        if (value) {
            // update value
            // delete statement
            await deleteStatementById(value.statementId);
            // dispatch(setIsDeletingValue({ id: id, status: false }));
            dispatch(
                deleteValue({
                    id: valuesIds[0],
                    propertyId: value.propertyId,
                }),
            );
        }

        handleAddValue(config._class, _value);
        setIsSaving(false);
    };

    const Forms = {
        boolean: (
            <>
                <Input
                    onChange={(e, _value) => updateValue({ label: e ? e.target.value : _value })}
                    value={value}
                    type="select"
                    name="literalValue"
                    bsSize="sm"
                    className="w-25 form-control-sm d-inline-block"
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </Input>
            </>
        ),
        autocomplete: (
            <>
                <AutoComplete
                    entityType={ENTITIES.RESOURCE}
                    optionsClass={range?.id}
                    placeholder={placeholder}
                    onChange={selected => {
                        updateValue(selected);
                    }}
                    value={value}
                    autoLoadOption={true}
                    openMenuOnFocus={true}
                    isClearable
                    allowCreate
                    autoFocus={false}
                    ols={true}
                    isMulti={false}
                    cssClasses="w-25 form-control-sm d-inline-block"
                />
            </>
        ),
        default: (
            <div className="w-25 d-inline-block">
                <InputGroup size="sm" className="d-flex ">
                    <Input
                        placeholder={placeholder}
                        name="literalValue"
                        type={inputFormType}
                        bsSize="sm"
                        value={inputValue}
                        onChange={e => {
                            setInputValue(e.target.value);
                        }}
                        className="flex-grow-1"
                        autoFocus
                        onFocus={onFocus}
                        onBlur={onBlur}
                    />
                    {focused && (
                        <StyledButton
                            className="px-3"
                            outline
                            onClick={() => {
                                updateValue({ label: inputValue });
                            }}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving' : 'Done'}
                        </StyledButton>
                    )}
                </InputGroup>
            </div>
        ),
    };

    return (
        <>
            <Tippy disabled={!description} content={description} trigger="focusin">
                <span>{Forms[inputFormType] || Forms.default}</span>
            </Tippy>
        </>
    );
};

FlashCardInputField.propTypes = {
    predicateId: PropTypes.string,
    resourceId: PropTypes.string,
};

export default FlashCardInputField;
