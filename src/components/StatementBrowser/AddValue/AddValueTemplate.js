import React, { useState, useRef, useEffect } from 'react';
import { resourcesUrl } from 'network';
import { Input, InputGroup, InputGroupAddon, DropdownMenu, InputGroupButtonDropdown, FormFeedback } from 'reactstrap';
import { StyledDropdownItem, StyledButton, StyledDropdownToggle, ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import useTogggle from './helpers/useToggle';
import validationSchema from './helpers/validationSchema';
import PropTypes from 'prop-types';

export default function AddValueTemplate(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);

    const isLiteral = props.predicate.templateClass && defaultDatatypes.map(t => t.id).includes(props.predicate.templateClass.id) ? true : false;
    const isTyped = props.predicate.templateClass ? true : false;

    let inputFormType = 'text';
    if (isTyped) {
        switch (props.predicate.templateClass.id) {
            case 'Date':
                inputFormType = 'date';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    }

    const [valueType, setValueType] = useState(isLiteral ? 'literal' : 'object');
    const [inputValue, setInputValue] = useState('');
    const [dropdownValueTypeOpen, setDropdownValueTypeOpen] = useTogggle(false);
    const [showAddValue, setShowAddValue] = useTogggle(false);
    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    useEffect(() => {
        if (valueType === 'literal' && literalInputRef.current) {
            literalInputRef.current.focus();
        } else if (resourceInputRef.current && (valueType === 'object' || valueType === 'property')) {
            resourceInputRef.current.focus();
        }
    }, [valueType]);

    useEffect(() => {
        if (!showAddValue) {
            setInputValue('');
        }
    }, [showAddValue]);

    /* Select component reference can be used to check if menu is opened */
    const isMenuOpen = () => {
        return resourceInputRef.current.select.state.menuIsOpen && resourceInputRef.current.state.loadedOptions.length > 0;
    };

    const validateValue = () => {
        if (props.predicate.templateClass && ['Date', 'Number', 'String'].includes(props.predicate.templateClass.id)) {
            const schema = validationSchema(props.predicate);
            const { error, value } = schema.validate(inputValue);
            if (error) {
                setFormFeedback(error.message);
                setIsValid(false);
                return false;
            } else {
                setInputValue(value);
                setFormFeedback(null);
                return value;
            }
        } else {
            setFormFeedback(null);
            return inputValue;
        }
    };

    const onSubmit = () => {
        const validatedValue = validateValue();
        if (validatedValue !== false) {
            props.handleAddValue(valueType, inputValue);
            setShowAddValue(false);
        }
    };

    return (
        <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
            {!showAddValue ? (
                <StatementOptionButton title={'Add value'} icon={faPlus} action={() => setShowAddValue(true)} />
            ) : (
                <div>
                    <InputGroup size="sm">
                        {!isTyped && (
                            <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownValueTypeOpen} toggle={setDropdownValueTypeOpen}>
                                <StyledDropdownToggle>
                                    <small>{valueType.charAt(0).toUpperCase() + valueType.slice(1) + ' '}</small>
                                    <Icon size="xs" icon={faBars} />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => setValueType('object')}>
                                        <Tippy content="Choose object to link this to an object, which can contain values on its own">
                                            <span>Object</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setValueType('literal')}>
                                        <Tippy content="Choose literal for values like numbers or plain text">
                                            <span>Literal</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        )}
                        {valueType === 'object' ? (
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
                                optionsClass={props.predicate.templateClass ? props.predicate.templateClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleValueSelect(valueType, i);
                                    setShowAddValue(false);
                                }}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                                additionalData={props.newResources}
                                disableBorderRadiusRight
                                disableBorderRadiusLeft={!isTyped}
                                cssClasses={'form-control-sm'}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddValue(false);
                                    } else if (e.keyCode === 13 && !isMenuOpen()) {
                                        props.handleAddValue(valueType, inputValue);
                                        setShowAddValue(false);
                                    }
                                }}
                                innerRef={ref => (resourceInputRef.current = ref)}
                            />
                        ) : (
                            <Input
                                placeholder="Enter a value"
                                name="literalValue"
                                type={inputFormType}
                                bsSize="sm"
                                value={inputValue}
                                onChange={(e, value) => setInputValue(e ? e.target.value : value)}
                                innerRef={literalInputRef}
                                invalid={!isValid}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddValue(false);
                                    } else if (e.keyCode === 13) {
                                        onSubmit();
                                    }
                                }}
                            />
                        )}
                        <InputGroupAddon addonType="append">
                            <StyledButton
                                outline
                                onClick={() => {
                                    setShowAddValue(false);
                                    setIsValid(true);
                                    setFormFeedback(null);
                                }}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton
                                outline
                                onClick={() => {
                                    onSubmit();
                                }}
                            >
                                Create
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {!isValid && <FormFeedback className={'d-block'}>{formFeedback}</FormFeedback>}
                </div>
            )}
        </ValueItemStyle>
    );
}

AddValueTemplate.propTypes = {
    predicate: PropTypes.object.isRequired,
    handleValueSelect: PropTypes.func.isRequired,
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired
};
