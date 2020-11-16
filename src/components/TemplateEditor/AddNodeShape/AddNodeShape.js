import React, { useRef, useState } from 'react';
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

const AddNodeShape = props => {
    const inputRef = useRef(null);
    const classAutocompleteRef = useRef(null);
    const predicateAutocompleteRef = useRef(null);
    const [label, setLabel] = useState('');
    const [targetClass, setTargetClass] = useState(null);
    const [predicate, setPredicate] = useState(null);
    const [researchFields, setResearchFields] = useState([]);
    const [researchProblems, setResearchProblems] = useState([]);

    const handleChangeLabel = event => {
        setLabel(event.target.value);
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
        <Modal isOpen={props.isOpen} toggle={props.handleClose} size="lg">
            <ModalHeader toggle={props.handleClose}>Add template</ModalHeader>

            <ModalBody className="p-4">
                <FormGroup className="mb-4">
                    <Label>Name of template</Label>
                    <Input name="templateName" innerRef={inputRef} value={label} onChange={handleChangeLabel} />
                </FormGroup>

                <FormGroup className="mb-4">
                    <Label>Target class</Label>
                    <AutoComplete
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
                            <small className="text-muted">
                                These fields are optional, the property is used to link the contribution resource to the template instance. The
                                research fields/problems are used to suggest this template in the relevant papers.
                            </small>
                        </p>
                        <FormGroup className="mb-4">
                            <Label>Property</Label>
                            <AutoComplete
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
                            <Label>Research fields</Label>
                            <AutoComplete
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
                            <Label>Research problems</Label>
                            <AutoComplete
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
                        props.handleComponentDrop(null, {
                            type: 'NodeShape',
                            configurations: { id: null, label: label, targetClass: targetClass, researchFields, researchProblems, predicate }
                        });
                        setLabel('');
                        setTargetClass(null);
                        setPredicate(null);
                        setResearchFields([]);
                        setResearchProblems([]);
                        props.handleClose();
                    }}
                >
                    Add to workspace
                </Button>{' '}
                <Button color="secondary" onClick={props.handleClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

AddNodeShape.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleComponentDrop: PropTypes.func.isRequired
};

export default AddNodeShape;
