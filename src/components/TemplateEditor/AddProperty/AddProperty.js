import React, { useRef, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, InputGroup, FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { classesUrl } from 'services/backend/classes';
import { predicatesUrl } from 'services/backend/predicates';
import ValidationRules from 'components/ContributionTemplates/TemplateComponent/ValidationRules/ValidationRules';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';

function AddProperty(props) {
    const classAutocompleteRef = useRef(null);
    const [value, setValue] = useState('');
    const [property, setProperty] = useState('');
    const [cardinality, setCardinality] = useState('0,*');
    const [minOccurs, setMinOccurs] = useState(null);
    const [maxOccurs, setMaxOccurs] = useState(null);

    const handleNewProperty = async () => {
        console.log('new');
    };

    return (
        <Modal isOpen={props.isOpen} toggle={props.handleClick}>
            <ModalHeader toggle={props.handleClick}>Add Property</ModalHeader>
            <ModalBody>
                <ValuesStyle className="col-12 valuesList">
                    <div>
                        <FormGroup row>
                            <Label className="text-right text-muted" for="test" sm={3}>
                                <small>Property</small>
                            </Label>
                            <Col sm={9}>
                                <InputGroup size="sm">
                                    <AutoComplete
                                        cssClasses="form-control-sm"
                                        requestUrl={predicatesUrl}
                                        placeholder="Select or type to enter a property"
                                        onItemSelected={selected => setProperty(selected)}
                                        onNewItemSelected={handleNewProperty}
                                        additionalData={[]}
                                        disableBorderRadiusRight
                                        allowCreate
                                        defaultOptions={[]}
                                        inputGroup={true}
                                    />
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="text-right text-muted" for="test" sm={3}>
                                <small>Range</small>
                            </Label>
                            <Col sm={9}>
                                <InputGroup size="sm">
                                    <AutoComplete
                                        requestUrl={classesUrl}
                                        placeholder="Select or type to enter a class"
                                        onChange={(selected, action) => {
                                            // blur the field allows to focus and open the menu again
                                            classAutocompleteRef.current && classAutocompleteRef.current.blur();
                                            setValue(selected);
                                        }}
                                        value={value}
                                        autoLoadOption={true}
                                        openMenuOnFocus={true}
                                        allowCreate={true}
                                        copyValueButton={true}
                                        isClearable
                                        defaultOptions={defaultDatatypes}
                                        innerRef={classAutocompleteRef}
                                        linkButton={value && value.id ? reverse(ROUTES.CLASS, { id: value.id }) : ''}
                                        linkButtonTippy="Go to class page"
                                        cssClasses="form-control-sm"
                                        autoFocus={false}
                                        ols={true}
                                    />
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <div className="mt-2">
                            <FormGroup row>
                                <Label className="text-right text-muted" for="cardinalityValueInput" sm={3}>
                                    <small>Cardinality</small>
                                </Label>
                                <Col sm={9}>
                                    <Input onChange={event => setCardinality(event.target.value)} value={cardinality} type="select" bsSize="sm">
                                        <option value="0,*">Zero or more [0,*]</option>
                                        <option value="0,1">Optional [0,1]</option>
                                        <option value="1,1">Exactly one [1,1]</option>
                                        <option value="1,*">One or more [1,*]</option>
                                        <option value="range">Custom...</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </div>
                        {cardinality === 'range' && (
                            <>
                                <div className="mt-2">
                                    <FormGroup row>
                                        <Label className="text-right text-muted" for="minOccursValueInput" sm={3}>
                                            <small>Minimum Occurence</small>
                                        </Label>
                                        <Col sm={9}>
                                            <Input
                                                onChange={e => setMinOccurs(e.target.value)}
                                                bsSize="sm"
                                                value={minOccurs}
                                                type="number"
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
                                            <small>Maximum Occurence</small>
                                        </Label>
                                        <Col sm={9}>
                                            <Input
                                                onChange={e => setMinOccurs(e.target.value)}
                                                bsSize="sm"
                                                value={maxOccurs !== null ? maxOccurs : ''}
                                                type="number"
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
                            </>
                        )}

                        {value && ['Number', 'String'].includes(value.id) && (
                            <ValidationRules validationRules={[]} id={value.id} value={value} enableEdit={true} />
                        )}
                    </div>
                </ValuesStyle>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={() => {
                        props.modelAdd.addOutputPort(property.value);
                        //props.modelAdd.getEngine().repaintCanvas();
                        setValue('');
                        setProperty('');
                        setCardinality('0,*');
                        setMinOccurs(null);
                        setMaxOccurs(null);
                        props.handleClick();
                    }}
                >
                    Add property
                </Button>{' '}
                <Button color="secondary" onClick={props.handleClick}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

AddProperty.propTypes = {
    handleClick: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    modelAdd: PropTypes.object
};

export default AddProperty;
