import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, FormText, CustomInput, Table } from 'reactstrap';
import PropTypes from 'prop-types';

function FormattedLabelForm(props) {
    const [labelFormat, setLabelFormat] = useState(null);
    const [hasLabelFormat, setHasLabelFormat] = useState(null);

    const handleChangeLabelFormat = event => {
        setLabelFormat(event.target.value);
    };

    const handleSwitchHasLabelFormat = event => {
        setHasLabelFormat(event.target.checked);
    };

    const outputPorts = Object.values(props.model.getOutputPorts()); // Properties

    useEffect(() => {
        if (props.isOpen) {
            setLabelFormat(props.model.labelFormat);
            setHasLabelFormat(props.model.hasLabelFormat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isOpen]);

    return (
        <Modal isOpen={props.isOpen} toggle={() => props.onClose()} size="lg">
            <ModalHeader toggle={() => props.onClose()}>Formatted label</ModalHeader>
            <ModalBody className="p-4">
                <FormGroup>
                    <div>
                        <CustomInput
                            onChange={handleSwitchHasLabelFormat}
                            checked={hasLabelFormat}
                            id="switchHasLabelFormat"
                            type="switch"
                            name="customSwitch"
                            label="Show formatted text instead of resource label"
                        />
                    </div>
                    {hasLabelFormat && outputPorts && outputPorts.length > 0 && (
                        <div className="mt-3">
                            <FormGroup className="mb-4">
                                <Label>Formatted label</Label>
                                <Input placeholder={'{P123} to {P456}'} value={labelFormat} onChange={handleChangeLabelFormat} />
                                <FormText>
                                    Use the reference of property IDs bellow to get each property placeholder.
                                    <br />
                                    The formatted text result will replace each {'{P…}'} placeholder in the string with its corresponding value.
                                    <br />
                                    e.g:{' '}
                                    <i>
                                        {'{P123}'} to {'{P456}'}
                                    </i>{' '}
                                    will give the result <i>value123 to value456</i>
                                </FormText>
                            </FormGroup>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Property</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outputPorts.map(port => (
                                        <tr key={`row${port.configurations.id}`}>
                                            <th scope="row">{port.configurations.id}</th>
                                            <td style={{}}>
                                                {port.configurations.label.charAt(0).toUpperCase() + port.configurations.label.slice(1)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {hasLabelFormat && outputPorts && outputPorts.length === 0 && (
                        <div className="mt-3 text-primary">Please add some properties first to use this feature.</div>
                    )}
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={() => {
                        props.model.updateFormattedLabel(hasLabelFormat, labelFormat);
                        props.onClose();
                    }}
                >
                    Save
                </Button>{' '}
                <Button color="secondary" onClick={() => props.onClose()}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

FormattedLabelForm.propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    model: PropTypes.object
};

export default FormattedLabelForm;
