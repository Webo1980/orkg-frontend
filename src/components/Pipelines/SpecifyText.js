import StepContainer from 'components/StepContainer';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Form, FormGroup, Input, Label } from 'reactstrap';

const SpecifyText = ({ text, setText }) => {
    const [selectedFile, setSelectedFile] = useState('');

    const handleFileUpload = e => {
        const file = e.target.files.length !== 0 ? e.target.files[0] : null;

        if (!file.type || file.type.indexOf('text/plain') === -1) {
            toast.error('Only .txt files are accepted');
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            setText(e.target.result);
        };
        reader.readAsText(e.target.files[0]);
        // reset the file value after reading, so uploading the same file is supported
        setSelectedFile('');
    };

    return (
        <StepContainer step="1" title="Specify text" bottomLine active>
            <Alert color="info" fade={false}>
                With this tool, you can create a pipeline to extract triples from a specified text
            </Alert>
            <Form>
                <FormGroup>
                    <div className="d-flex justify-content-between align-items-end">
                        <Label htmlFor="input-text">Input text</Label>
                        <label className="btn btn-darkblue btn-sm">
                            Upload text file
                            <input type="file" hidden onChange={handleFileUpload} value={selectedFile} accept="text/plain" />
                        </label>
                    </div>
                    <Input
                        type="textarea"
                        id="input-text"
                        rows="6"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        style={{ fontSize: '90%' }}
                    />
                </FormGroup>
            </Form>
        </StepContainer>
    );
};

SpecifyText.propTypes = {
    text: PropTypes.string.isRequired,
    setText: PropTypes.func.isRequired
};

export default SpecifyText;
