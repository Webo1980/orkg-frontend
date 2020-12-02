import StepContainer from 'components/StepContainer';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Form, FormGroup, Input, Label } from 'reactstrap';
import { getComponents, getPipelines } from 'services/pipeline';
import Select, { components } from 'react-select';
import PropTypes from 'prop-types';

const Option = ({ children, ...props }) => <components.Option {...props}>{children}</components.Option>;

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const Pipelines = () => {
    const [text, setText] = useState('');
    const [latestStep, setLatestStep] = useState(1);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [pipelines, setPipelines] = useState([]);
    const pipelineOptions = pipelines.map(pipeline => ({
        label: pipeline.name,
        value: pipeline.name
    }));
    const [components, setComponents] = useState([]);

    useEffect(() => {
        document.title = 'Pipeline configurator - ORKG';
    }, []);

    useEffect(() => {
        if (text && latestStep === 1) {
            setLatestStep(2);
        } else if (!text && latestStep === 2) {
            setLatestStep(1);
        }
    }, [text, latestStep]);

    useEffect(() => {
        if (latestStep === 2 && pipelines.length === 0) {
            const _getPipelines = async () => {
                const _pipelines = await getPipelines();
                setPipelines(_pipelines);
            };
            _getPipelines();
            const _getComponents = async () => {
                const _components = await getComponents();
                setComponents(_components);
            };
            _getComponents();
        }
    }, [latestStep, pipelines]);

    const title = <>Specify text</>;

    const handleFileUpload = e => {
        const file = e.target.files.length !== 0 ? e.target.files[0] : null;
        console.log('handleFileUpload');

        if (!file.type || file.type.indexOf('text/plain') === -1) {
            toast.error('Only .txt files are accepted');
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            console.log('test, set text');
            setText(e.target.result);
        };
        reader.readAsText(e.target.files[0]);
    };

    return (
        <div>
            <StepContainer step="1" title={title} bottomLine active>
                <Alert color="info" fade={false}>
                    With this tool, you can create a pipeline to extract triples from a specified text
                </Alert>
                <Form>
                    <FormGroup>
                        <div className="d-flex justify-content-between align-items-end">
                            <Label htmlFor="input-text">Input text</Label>
                            <label className="btn btn-darkblue btn-sm">
                                Upload text file
                                <input type="file" hidden onChange={handleFileUpload} accept="text/plain" />
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
            <StepContainer step="2" title="Select pipeline" topLine bottomLine active={latestStep > 1}>
                <Label htmlFor="pipeline-input">Predefined configuration</Label>
                <Select
                    inputId="pipeline-input"
                    value={selectedPipeline}
                    onChange={selected => setSelectedPipeline(selected)}
                    options={pipelineOptions}
                    components={{ Option }}
                />
            </StepContainer>

            <StepContainer step="3" title="Output" topLine active={latestStep > 2} />
        </div>
    );
};

export default Pipelines;
