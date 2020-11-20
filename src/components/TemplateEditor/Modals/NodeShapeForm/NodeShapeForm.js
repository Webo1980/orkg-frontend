import React, { useRef, useState, useEffect } from 'react';
import { FormGroup, Label, FormText, Input, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { classesUrl } from 'services/backend/classes';
import { createPredicate, predicatesUrl } from 'services/backend/predicates';
import { resourcesUrl } from 'services/backend/resources';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { CLASSES } from 'constants/graphSettings';
import { toast } from 'react-toastify';

const NodeShapeForm = props => {
    const classAutocompleteRef = useRef(null);
    const predicateAutocompleteRef = useRef(null);

    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [targetClass, setTargetClass] = useState(null);
    const [predicate, setPredicate] = useState(null);
    const [researchFields, setResearchFields] = useState([]);
    const [researchProblems, setResearchProblems] = useState([]);

    useEffect(() => {
        if (props.model) {
            setLabel(props.model.label);
            setDescription(props.model.description);
            setTargetClass(props.model.targetClass);
            setPredicate(props.model.predicate);
            setResearchFields(props.model.researchFields);
            setResearchProblems(props.model.researchProblems);
        } else {
            setLabel('');
            setDescription('');
            setTargetClass(null);
            setPredicate(null);
            setResearchFields([]);
            setResearchProblems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isOpen]);

    const validateData = () => {
        if (!label) {
            toast.error('Please enter the name of the template');
            return false;
        }
        return true;
    };

    const handlePropertySelect = async (selected, { action }) => {
        if (action === 'select-option') {
            setPredicate(selected);
        } else if (action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new property?',
                message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newPredicate = await createPredicate(selected.label);
                selected.id = newPredicate.id;
                setPredicate(selected);
            }
            // blur the field allows to focus and open the menu again
            predicateAutocompleteRef.current && predicateAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            setPredicate(null);
        }
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            setTargetClass(selected);
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label
            });
            if (newClass) {
                selected.id = newClass.id;
                setTargetClass(selected);
            }
            // blur the field allows to focus and open the menu again
            classAutocompleteRef.current && classAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            setTargetClass(null);
        }
    };

    const handleResearchFieldSelect = selected => {
        setResearchFields(!selected ? [] : selected);
    };

    const handleResearchProblemSelect = selected => {
        setResearchProblems(!selected ? [] : selected);
    };

    return (
        <Modal isOpen={props.isOpen} toggle={props.onClose} size="lg">
            <ModalHeader toggle={props.onClose}>{props.model ? 'Edit ' : 'Add '} template</ModalHeader>

            <ModalBody className="p-4">
                <FormGroup className="mb-4">
                    <Label for="templateName">Name</Label>
                    <Input
                        placeholder="Template name"
                        id="templateName"
                        name="templateName"
                        value={label}
                        onChange={event => setLabel(event.target.value)}
                    />
                </FormGroup>

                <FormGroup className="mb-4">
                    <Label for="templateDescription">Description</Label>
                    <Input
                        placeholder="Template description"
                        id="templateDescription"
                        name="templateDescription"
                        type="textarea"
                        value={description}
                        onChange={event => setDescription(event.target.value)}
                    />
                </FormGroup>

                <FormGroup className="mb-4">
                    <Label for="templateTarget">Target class</Label>
                    <AutoComplete
                        inputId="templateTarget"
                        requestUrl={classesUrl}
                        placeholder="Select or type to enter a class"
                        onChange={handleClassSelect}
                        value={targetClass}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={true}
                        copyValueButton={true}
                        isClearable
                        innerRef={classAutocompleteRef}
                        autoFocus={false}
                        linkButton={targetClass && targetClass.id ? reverse(ROUTES.CLASS, { id: targetClass.id }) : ''}
                        linkButtonTippy="Go to class page"
                    />
                    <FormText>Specify the class of this template. If not specified, a class is generated automatically.</FormText>
                </FormGroup>
                <>
                    <fieldset className="scheduler-border">
                        <legend className="scheduler-border">Template use cases</legend>
                        <p>
                            <small className="text-muted">These fields are optional.</small>
                        </p>
                        <FormGroup className="mb-4">
                            <Label for="templatePredicate">Property</Label>
                            <AutoComplete
                                inputId="templatePredicate"
                                requestUrl={predicatesUrl}
                                placeholder="Select or type to enter a property"
                                onChange={handlePropertySelect}
                                value={predicate}
                                autoLoadOption={true}
                                openMenuOnFocus={true}
                                allowCreate={true}
                                autoFocus={false}
                                isClearable
                                innerRef={predicateAutocompleteRef}
                            />
                            <FormText>
                                Specify the property of this template. This property is used to link the contribution to the template instance.
                            </FormText>
                        </FormGroup>
                        <FormGroup className="mb-4">
                            <Label for="templateResearchField">Research fields</Label>
                            <AutoComplete
                                inputId="templateResearchField"
                                requestUrl={resourcesUrl}
                                optionsClass={CLASSES.RESEARCH_FIELD}
                                placeholder="Select or type to enter a research field"
                                onChange={handleResearchFieldSelect}
                                value={researchFields}
                                autoLoadOption={true}
                                openMenuOnFocus={true}
                                autoFocus={false}
                                allowCreate={false}
                                isClearable
                                isMulti
                            />
                            <FormText>Specify the research fields that uses this template.</FormText>
                        </FormGroup>
                        <FormGroup className="mb-4">
                            <Label for="templateResearchProblems">Research problems</Label>
                            <AutoComplete
                                inputId="templateResearchProblems"
                                requestUrl={resourcesUrl}
                                optionsClass={CLASSES.PROBLEM}
                                placeholder="Select or type to enter a research problem"
                                onChange={handleResearchProblemSelect}
                                value={researchProblems}
                                autoLoadOption={true}
                                openMenuOnFocus={true}
                                autoFocus={false}
                                allowCreate={false}
                                isClearable
                                isMulti
                            />
                            <FormText>Specify the research problems that uses this template.</FormText>
                        </FormGroup>
                    </fieldset>
                </>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={() => {
                        if (validateData()) {
                            if (props.model) {
                                // Edit a template
                                props.model.updateConfiguration({
                                    label: label,
                                    targetClass: targetClass,
                                    researchFields,
                                    researchProblems,
                                    predicate
                                });
                            } else {
                                //Create a new template
                                props.handleComponentDrop(null, {
                                    type: 'NodeShape',
                                    configurations: { label: label, targetClass: targetClass, researchFields, researchProblems, predicate }
                                });
                            }
                            props.onClose();
                        }
                    }}
                >
                    {props.model ? 'Save' : 'Add to workspace'}
                </Button>{' '}
                <Button color="secondary" onClick={props.onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

NodeShapeForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handleComponentDrop: PropTypes.func,
    model: PropTypes.object
};

export default NodeShapeForm;
