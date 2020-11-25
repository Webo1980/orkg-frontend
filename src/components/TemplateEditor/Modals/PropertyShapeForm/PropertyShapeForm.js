import React, { useRef, useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, InputGroup, FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import Joi from '@hapi/joi';
import Confirm from 'reactstrap-confirm';
import { classesUrl } from 'services/backend/classes';
import { createPredicate, predicatesUrl } from 'services/backend/predicates';
import PortModel from 'components/TemplateEditor/core/Port/PortModel';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import ValidationRulesFormFactory from 'components/TemplateEditor/Modals/PropertyShapeForm/ValidationRulesForms/ValidationRulesFormFactory';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import { Fieldset } from 'components/TemplateEditor/styled';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';

function PropertyShapeForm(props) {
    const propertyAutocompleteRef = useRef(null);
    const classAutocompleteRef = useRef(null);
    const [property, setProperty] = useState(null);
    const [valueType, setValueType] = useState(null);
    const [cardinality, setCardinality] = useState('0..*');
    const [minOccurs, setMinOccurs] = useState(null);
    const [maxOccurs, setMaxOccurs] = useState(null);
    const [validationRules, setValidationRules] = useState(null);

    useEffect(() => {
        if (props.model instanceof PortModel) {
            // Edit property
            setProperty({ id: props.model.configurations.id, label: props.model.configurations.label });
            setValueType(props.model.configurations.valueType);
            setCardinality(props.model.configurations.cardinality);
            setMinOccurs(props.model.configurations.minOccurs);
            setMaxOccurs(props.model.configurations.maxOccurs);
            setValidationRules(props.model.configurations.validationRules);
        } else {
            // Add Property
            setProperty(null);
            setValueType(null);
            setCardinality('0..*');
            setMinOccurs(null);
            setMaxOccurs(null);
            setValidationRules(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isOpen]);

    const validateData = data => {
        const schema = Joi.object().keys({
            property: Joi.object()
                .keys({
                    id: Joi.string().label('id'),
                    label: Joi.string().label('Label')
                })
                .required()
                .error(new Error('Please select a property')),
            cardinality: Joi.string().label('Cardinality'),
            minOccurs: Joi.number()
                .integer()
                .allow('')
                .label('Minimum occurrence'),
            maxOccurs: Joi.number()
                .integer()
                .allow('')
                .label('Maximum occurrence'),
            validationRules: Joi.object({
                pattern: Joi.string().label('Pattern'),
                min: Joi.number()
                    .allow('')
                    .label('Minimum value'),
                max: Joi.number()
                    .allow('')
                    .label('Maximum value')
            }).allow(null)
        });
        if (data) {
            const { error } = schema.validate(data, {
                allowUnknown: true
            });
            if (error) {
                toast.error(error.message);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            setValueType(selected);
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label
            });
            if (newClass) {
                selected.id = newClass.id;
                setValueType(selected);
            }
            // blur the field allows to focus and open the menu again
            classAutocompleteRef.current && classAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            setValueType(null);
        }
    };

    const handlePropertySelect = async (selected, action) => {
        if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new property?',
                message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newPredicate = await createPredicate(selected.label);
                selected = { id: newPredicate.id, label: selected.label };
                setProperty(selected);
            }
        } else {
            setProperty(selected);
        }
        // blur the field allows to focus and open the menu again
        propertyAutocompleteRef.current && propertyAutocompleteRef.current.blur();
    };

    return (
        <Modal isOpen={props.isOpen} toggle={() => props.onClose()} size="lg">
            <ModalHeader toggle={() => props.onClose()}>{props.model instanceof PortModel ? 'Edit property' : 'Add property'}</ModalHeader>
            <ModalBody className="p-4">
                <ValuesStyle>
                    <div>
                        <FormGroup row>
                            <Label className="text-right text-muted" for="propertyShape" sm={3}>
                                Property
                            </Label>
                            <Col sm={9}>
                                <InputGroup>
                                    <AutoComplete
                                        inputId="propertyShape"
                                        requestUrl={predicatesUrl}
                                        placeholder="Select or type to enter a property"
                                        onChange={handlePropertySelect}
                                        additionalData={[]}
                                        allowCreate
                                        value={property}
                                        defaultOptions={[]}
                                        inputGroup={true}
                                        innerRef={propertyAutocompleteRef}
                                    />
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="text-right text-muted" for="shapeClass" sm={3}>
                                Range
                            </Label>
                            <Col sm={9}>
                                <InputGroup>
                                    <AutoComplete
                                        inputId="shapeClass"
                                        requestUrl={classesUrl}
                                        placeholder="Select or type to enter a class"
                                        onChange={handleClassSelect}
                                        value={valueType}
                                        autoLoadOption={true}
                                        openMenuOnFocus={true}
                                        allowCreate={true}
                                        copyValueButton={true}
                                        isClearable
                                        defaultOptions={defaultDatatypes}
                                        innerRef={classAutocompleteRef}
                                        linkButton={valueType && valueType.id ? reverse(ROUTES.CLASS, { id: valueType.id }) : ''}
                                        linkButtonTippy="Go to class page"
                                        autoFocus={false}
                                        ols={true}
                                    />
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <div className="mt-2">
                            <FormGroup row>
                                <Label className="text-right text-muted" for="cardinalityConstraint" sm={3}>
                                    Cardinality
                                </Label>
                                <Col sm={9}>
                                    <Input
                                        inputid="cardinalityConstraint"
                                        onChange={event => {
                                            if (event.target.value === 'range') {
                                                setCardinality(event.target.value);
                                                setMinOccurs('0');
                                                setMaxOccurs('');
                                            } else {
                                                const card = event.target.value.split('..');
                                                setCardinality(event.target.value);
                                                setMinOccurs(card[0]);
                                                setMaxOccurs(card[1] !== '*' ? card[1] : '');
                                            }
                                        }}
                                        value={cardinality}
                                        type="select"
                                    >
                                        <option value="0..*">Zero or more [0..*]</option>
                                        <option value="0..1">Optional [0..1]</option>
                                        <option value="1..1">Exactly one [1..1]</option>
                                        <option value="1..*">One or more [1..*]</option>
                                        <option value="range">Custom...</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </div>
                        {cardinality === 'range' && (
                            <Fieldset className="border pl-4 pr-4 pt-2 pb-2">
                                <legend className="w-auto pl-1 pr-1">
                                    <small>Custom Cardinality</small>
                                </legend>
                                <div className="mt-2">
                                    <FormGroup row>
                                        <Label className="text-right text-muted" for="minOccursValueInput" sm={3}>
                                            <small>Minimum occurrence</small>
                                        </Label>
                                        <Col sm={9}>
                                            <Input
                                                onChange={e => setMinOccurs(e.target.value)}
                                                bsSize="sm"
                                                value={minOccurs}
                                                type="text"
                                                min="0"
                                                step="1"
                                                name="minOccurs"
                                                id="minOccursValueInput"
                                                placeholder="Minimum number of occurrences in the resource"
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label className="text-right text-muted" for="maxOccursValueInput" sm={3}>
                                            <small>Maximum occurrence</small>
                                        </Label>
                                        <Col sm={9}>
                                            <Input
                                                onChange={e => setMaxOccurs(e.target.value)}
                                                bsSize="sm"
                                                value={maxOccurs !== null ? maxOccurs : ''}
                                                type="text"
                                                min="0"
                                                step="1"
                                                name="maxOccurs"
                                                id="maxOccursValueInput"
                                                placeholder="Maximum number of occurrences in the resource"
                                            />
                                            <FormText className="d-block">Clear the input field if there is no restriction (unbounded)</FormText>
                                        </Col>
                                    </FormGroup>
                                </div>
                            </Fieldset>
                        )}
                        <ValidationRulesFormFactory valueType={valueType} validationRules={validationRules} onChange={setValidationRules} />
                    </div>
                </ValuesStyle>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={() => {
                        const data = {
                            id: property?.id,
                            label: property?.label,
                            property: property,
                            valueType: valueType,
                            cardinality: cardinality,
                            minOccurs: minOccurs,
                            maxOccurs: maxOccurs,
                            validationRules: validationRules
                        };
                        if (validateData(data)) {
                            if (props.model instanceof PortModel) {
                                props.model.updateConfiguration(data);
                            } else {
                                props.model.addOutputPort(property.id, data);
                            }
                            props.onClose();
                        }
                    }}
                >
                    {props.model instanceof PortModel ? 'Save' : 'Add property'}
                </Button>{' '}
                <Button color="secondary" onClick={() => props.onClose()}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

PropertyShapeForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    model: PropTypes.object,
    engine: PropTypes.object,
    repaint: PropTypes.func
};

export default PropertyShapeForm;
