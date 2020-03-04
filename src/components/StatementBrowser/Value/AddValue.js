import React, { Component } from 'react';
import {
    resourcesUrl,
    createResourceStatement,
    createResource,
    createLiteral,
    createLiteralStatement,
    predicatesUrl,
    createPredicate
} from '../../../network';
import { Input, InputGroup, InputGroupAddon, Button, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import Tooltip from '../../Utils/Tooltip';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars } from '@fortawesome/free-solid-svg-icons';
import { StyledValueItem, StyledDropdownItem, StyledButton, StyledDropdownToggle, ValueItemStyle } from '../../AddPaper/Contributions/styled';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizard/TemplateOptionButton';
import AutoComplete from '../AutoComplete';
import { connect } from 'react-redux';
import { createValue, createProperty } from '../../../actions/statementBrowser';
import PropTypes from 'prop-types';

class AddValue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            dropdownValueTypeOpen: false,
            showAddValue: false,
            valueType: 'object',
            inputValue: ''
        };

        this.literalInputRef = React.createRef();
        this.resourceInputRef = React.createRef();
    }

    toggleDropDownValueType = () => {
        this.setState({
            dropdownValueTypeOpen: !this.state.dropdownValueTypeOpen
        });
    };

    handleShowAddValue = () => {
        this.setState({
            showAddValue: true
        });
    };

    handleHideAddValue = () => {
        this.setState({
            showAddValue: false,
            inputValue: '',
            valueType: 'object'
        });
    };

    handleDropdownSelect = valueType => {
        this.setState(
            {
                valueType
            },
            () => {
                if (valueType === 'literal') {
                    this.literalInputRef.current.focus();
                } else if (valueType === 'object' || valueType === 'property') {
                    this.resourceInputRef.focus();
                }
            }
        );
    };

    handleInputChange = (e, value) => {
        const inputValue = e ? e.target.value : value;

        this.setState({
            inputValue
        });
    };

    handleValueSelect = async ({ id, value, shared, classes }) => {
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId];
            const newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, id);
            this.props.createValue({
                label: value,
                type: this.state.valueType,
                propertyId: this.props.propertyId,
                classes: classes,
                existingResourceId: id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: shared
            });
        } else {
            this.props.createValue({
                label: value,
                type: this.state.valueType,
                propertyId: this.props.propertyId,
                classes: classes,
                existingResourceId: id,
                isExistingValue: true,
                shared: shared
            });
        }

        this.handleHideAddValue();
    };

    handleAddValue = async () => {
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId];
            let newObject = null;
            let newStatement = null;
            switch (this.state.valueType) {
                case 'object':
                    newObject = await createResource(this.state.inputValue);
                    newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                case 'property':
                    newObject = await createPredicate(this.state.inputValue);
                    newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                default:
                    newObject = await createLiteral(this.state.inputValue);
                    newStatement = await createLiteralStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
            }
            this.props.createValue({
                label: this.state.inputValue,
                type: this.state.valueType,
                propertyId: this.props.propertyId,
                existingResourceId: newObject.id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: newObject.shared
            });
        } else {
            const predicate = this.props.properties.byId[this.props.propertyId];
            this.props.createValue({
                label: this.state.inputValue,
                type: this.state.valueType,
                propertyId: this.props.propertyId,
                templateId: predicate.templateId ? predicate.templateId : null,
                shared: 1
            });
        }

        this.handleHideAddValue();
    };

    getNewResources = () => {
        const resourceList = [];

        for (const key in this.props.newResources) {
            const resource = this.props.newResources[key];

            if (!resource.existingResourceId) {
                resourceList.push({
                    id: resource.id,
                    label: resource.label
                });
            }
        }

        return resourceList;
    };

    /* Select component reference can be used to check if menu is opened */
    isMenuOpen = () => {
        return this.resourceInputRef.select.state.menuIsOpen && this.resourceInputRef.state.loadedOptions.length > 0;
    };

    render() {
        const predicate = this.props.properties.byId[this.props.propertyId];

        return (
            <>
                {this.props.contextStyle === 'StatementBrowser' ? (
                    <StyledValueItem>
                        {this.state.showAddValue ? (
                            <InputGroup>
                                {![process.env.REACT_APP_TEMPLATE_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                                    this.props.properties.byId[this.props.propertyId].existingPredicateId
                                ) && (
                                    <InputGroupButtonDropdown
                                        addonType="prepend"
                                        isOpen={this.state.dropdownValueTypeOpen}
                                        toggle={this.toggleDropDownValueType}
                                    >
                                        <DropdownToggle caret color="primary" className={'valueTypeDropdown'}>
                                            {this.state.valueType.charAt(0).toUpperCase() + this.state.valueType.slice(1)}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <StyledDropdownItem onClick={() => this.handleDropdownSelect('object')}>
                                                <Tooltip message="Choose object to link this to an object, which can contain values on its own">
                                                    Object
                                                </Tooltip>
                                            </StyledDropdownItem>
                                            <StyledDropdownItem onClick={() => this.handleDropdownSelect('literal')}>
                                                <Tooltip message="Choose literal for values like numbers or plain text">Literal</Tooltip>
                                            </StyledDropdownItem>
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                )}

                                {this.state.valueType === 'object' ? (
                                    <AutoComplete
                                        requestUrl={
                                            ![process.env.REACT_APP_TEMPLATE_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                                                this.props.properties.byId[this.props.propertyId].existingPredicateId
                                            )
                                                ? resourcesUrl
                                                : predicatesUrl
                                        }
                                        excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
                                        placeholder="Enter a resource"
                                        onItemSelected={this.handleValueSelect}
                                        onInput={this.handleInputChange}
                                        value={this.state.inputValue}
                                        additionalData={this.getNewResources()}
                                        disableBorderRadiusRight
                                        disableBorderRadiusLeft
                                        onKeyDown={e => {
                                            if (e.keyCode === 27) {
                                                // escape
                                                this.handleHideAddValue();
                                            } else if (e.keyCode === 13 && !this.isMenuOpen()) {
                                                this.handleAddValue();
                                            }
                                        }}
                                        innerRef={ref => (this.resourceInputRef = ref)}
                                    />
                                ) : (
                                    <Input
                                        placeholder="Enter a value"
                                        name="literalValue"
                                        value={this.state.inputValue}
                                        onChange={this.handleInputChange}
                                        innerRef={this.literalInputRef}
                                        onKeyDown={e => {
                                            if (e.keyCode === 27) {
                                                // escape
                                                this.handleHideAddValue();
                                            } else if (e.keyCode === 13) {
                                                this.handleAddValue();
                                            }
                                        }}
                                    />
                                )}

                                <InputGroupAddon addonType="append">
                                    <Button color="light" className={'valueActionButton'} onClick={this.handleHideAddValue}>
                                        Cancel
                                    </Button>

                                    {![process.env.REACT_APP_TEMPLATE_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                                        this.props.properties.byId[this.props.propertyId].existingPredicateId
                                    ) && (
                                        <Button color="light" className={'valueActionButton'} onClick={this.handleAddValue}>
                                            Create
                                        </Button>
                                    )}

                                    {[process.env.REACT_APP_TEMPLATE_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                                        this.props.properties.byId[this.props.propertyId].existingPredicateId
                                    ) && (
                                        <Button
                                            color="light"
                                            className={'valueActionButton'}
                                            onClick={() => {
                                                this.setState(
                                                    {
                                                        valueType: 'property'
                                                    },
                                                    () => this.handleAddValue()
                                                );
                                            }}
                                        >
                                            Create
                                        </Button>
                                    )}
                                </InputGroupAddon>
                            </InputGroup>
                        ) : (
                            <span className="btn btn-link p-0" onClick={this.handleShowAddValue}>
                                + Add value
                            </span>
                        )}
                    </StyledValueItem>
                ) : (
                    <ValueItemStyle className={this.state.showAddValue ? 'editingLabel' : ''}>
                        {!this.state.showAddValue ? (
                            <TemplateOptionButton title={'Add value'} icon={faPlus} action={this.handleShowAddValue} />
                        ) : (
                            <div>
                                <InputGroup size="sm">
                                    <InputGroupButtonDropdown
                                        addonType="prepend"
                                        isOpen={this.state.dropdownValueTypeOpen}
                                        toggle={this.toggleDropDownValueType}
                                    >
                                        <StyledDropdownToggle>
                                            <Icon size="xs" icon={faBars} />
                                        </StyledDropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={() => this.handleDropdownSelect('object')}>Object</DropdownItem>
                                            <DropdownItem onClick={() => this.handleDropdownSelect('literal')}>Literal</DropdownItem>
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    {this.state.valueType === 'object' ? (
                                        <AutoComplete
                                            requestUrl={resourcesUrl}
                                            excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
                                            optionsClass={
                                                predicate.existingPredicateId === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM
                                                    ? process.env.REACT_APP_CLASSES_PROBLEM
                                                    : undefined
                                            }
                                            placeholder="Enter a resource"
                                            onItemSelected={this.handleValueSelect}
                                            onInput={this.handleInputChange}
                                            value={this.state.inputValue}
                                            additionalData={this.getNewResources()}
                                            disableBorderRadiusRight
                                            disableBorderRadiusLeft
                                            cssClasses={'form-control-sm'}
                                            onKeyDown={e => {
                                                if (e.keyCode === 27) {
                                                    // escape
                                                    this.handleHideAddValue();
                                                } else if (e.keyCode === 13 && !this.isMenuOpen()) {
                                                    this.handleAddValue();
                                                }
                                            }}
                                            innerRef={ref => (this.resourceInputRef = ref)}
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Enter a value"
                                            name="literalValue"
                                            bsSize="sm"
                                            value={this.state.inputValue}
                                            onChange={this.handleInputChange}
                                            onKeyDown={e => {
                                                if (e.keyCode === 27) {
                                                    // escape
                                                    this.handleHideAddValue();
                                                } else if (e.keyCode === 13) {
                                                    this.handleAddValue();
                                                }
                                            }}
                                            innerRef={this.literalInputRef}
                                        />
                                    )}

                                    <InputGroupAddon addonType="append">
                                        <StyledButton outline onClick={this.handleHideAddValue}>
                                            Cancel
                                        </StyledButton>
                                        <StyledButton outline onClick={this.handleAddValue}>
                                            Create
                                        </StyledButton>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        )}
                    </ValueItemStyle>
                )}
            </>
        );
    }
}

AddValue.propTypes = {
    createValue: PropTypes.func.isRequired,
    propertyId: PropTypes.string,
    selectedResource: PropTypes.string.isRequired,
    newResources: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    properties: PropTypes.object.isRequired,
    contextStyle: PropTypes.string.isRequired,
    createProperty: PropTypes.func.isRequired
};

AddValue.defaultProps = {
    contextStyle: 'StatementBrowser'
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
        newResources: state.statementBrowser.resources.byId,
        properties: state.statementBrowser.properties
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createProperty: data => dispatch(createProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddValue);
