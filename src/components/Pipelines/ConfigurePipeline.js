import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PipelineComponent from 'components/Pipelines/PipelineComponent';
import StepContainer from 'components/StepContainer';
import { xor } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { toast } from 'react-toastify';
import { Button, Label } from 'reactstrap';
import { getComponents, getPipelines, runPipeline } from 'services/pipeline';
import styled from 'styled-components';

const ComponentsWrapper = styled.div`
    background: ${props => props.theme.themeColors.lightblue};
    border-radius: ${props => props.theme.borderRadius};
    border: 1px solid #cfd2dd;
    margin-top: 20px;
    display: flex;
`;

const Category = styled.div`
    border-right: 1px solid #cfd2dd;
    flex: 33%;
    padding: 10px 0 0 0;

    &:last-child {
        border: 0;
    }
`;

const Option = ({ children, ...props }) => <components.Option {...props}>{children}</components.Option>;

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const ConfigurePipeline = props => {
    const { text, latestStep, setLatestStep, setTriples } = props;
    //const [show, setShow] = useState('all');
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [pipelines, setPipelines] = useState([]);
    const [components, setComponents] = useState([]);
    const [selectedExtractors, setSelectedExtractors] = useState([]);
    const [selectedLinkers, setSelectedLinkers] = useState([]);
    const [selectedResolvers, setSelectedResolvers] = useState([]);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);

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

    const pipelineOptions = pipelines.map(pipeline => ({
        label: pipeline.name,
        value: pipeline.name
    }));

    const handleSelectPipeline = selected => {
        const { linkers, extractors, resolvers } = pipelines.find(pipeline => pipeline.name === selected.value);
        setSelectedPipeline(selected);
        setSelectedLinkers(linkers || []);
        setSelectedExtractors(extractors || []);
        setSelectedResolvers(resolvers || []);
    };

    const toggleSelectedExtractors = name => {
        setSelectedExtractors(current => xor(current, [name]));
        setSelectedPipeline(null);
    };

    const toggleSelectedLinkers = name => {
        setSelectedLinkers(current => xor(current, [name]));
        setSelectedPipeline(null);
    };

    const toggleSelectedResolvers = name => {
        setSelectedResolvers(current => xor(current, [name]));
        setSelectedPipeline(null);
    };

    const isValidConfiguration = selectedExtractors.length !== 0 || (selectedResolvers.length !== 0 && selectedResolvers.length !== 0);

    const handleRunPipeline = async () => {
        if (!isValidConfiguration) {
            toast.error('Invalid configuration: select at least one extractor');
            return;
        }
        setIsPipelineRunning(true);
        const _triples = await runPipeline({
            extractors: selectedExtractors,
            resolvers: selectedResolvers,
            linkers: selectedLinkers,
            inputText: text
        });
        setIsPipelineRunning(false);
        setLatestStep(3);
        setTriples(_triples);
    };

    return (
        <StepContainer step="2" title="Select pipeline" topLine bottomLine active={latestStep > 1}>
            <div className="d-flex">
                <div style={{ maxWidth: 400 }} className="flex-grow-1">
                    <Label htmlFor="pipeline-input">Predefined configuration</Label>
                    <Select
                        inputId="pipeline-input"
                        value={selectedPipeline}
                        onChange={handleSelectPipeline}
                        options={pipelineOptions}
                        components={{ Option }}
                    />
                </div>
                {/*<div style={{ maxWidth: 250 }} className="ml-3 flex-grow-1">
                    <Label htmlFor="show-components">Show</Label>
                    <Input type="select" value={show} onChange={e => setShow(e.target.value)} id="show-components">
                        <option value="all">All components</option>
                        <option value="orkg-only">ORKG-only components</option>
                    </Input>
                </div>*/}
            </div>
            <ComponentsWrapper>
                <Category>
                    <h2 className="h4 my-2 ml-4">Extractors</h2>
                    <div className="p-3">
                        {components
                            .filter(({ task }) => task === 'TE')
                            .map(({ key, desc, url, name }) => (
                                <PipelineComponent
                                    key={key}
                                    desc={desc}
                                    url={url}
                                    name={name}
                                    active={selectedExtractors.includes(key)}
                                    handleClick={() => toggleSelectedExtractors(key)}
                                />
                            ))}
                    </div>
                </Category>
                <Category>
                    <h2 className="h4 my-2 ml-4">Resolvers</h2>
                    <div className="p-3">
                        {components
                            .filter(({ task }) => task === 'CR')
                            .map(({ key, desc, url, name }) => (
                                <PipelineComponent
                                    key={key}
                                    desc={desc}
                                    url={url}
                                    name={name}
                                    active={selectedResolvers.includes(key)}
                                    handleClick={() => toggleSelectedResolvers(key)}
                                />
                            ))}
                    </div>
                </Category>
                <Category>
                    <h2 className="h4 my-2 ml-4">Linkers</h2>
                    <div className="p-3">
                        {components
                            .filter(({ task }) => task === 'EL/RL' || task === 'EL' || task === 'RL')
                            .map(({ key, desc, url, name }) => (
                                <PipelineComponent
                                    key={key}
                                    desc={desc}
                                    url={url}
                                    name={name}
                                    active={selectedLinkers.includes(key)}
                                    handleClick={() => toggleSelectedLinkers(key)}
                                />
                            ))}
                    </div>
                </Category>
            </ComponentsWrapper>
            <div className="text-center mt-3">
                <Button color="primary" onClick={handleRunPipeline} disabled={isPipelineRunning}>
                    {!isPipelineRunning ? (
                        'Run pipeline'
                    ) : (
                        <>
                            <Icon icon={faSpinner} spin /> Loading
                        </>
                    )}
                </Button>
            </div>
        </StepContainer>
    );
};

ConfigurePipeline.propTypes = {
    text: PropTypes.string.isRequired,
    latestStep: PropTypes.number.isRequired,
    setLatestStep: PropTypes.func.isRequired,
    setTriples: PropTypes.func.isRequired
};

export default ConfigurePipeline;
