import ConfigurePipeline from 'components/Pipelines/ConfigurePipeline';
import Output from 'components/Pipelines/Output';
import SpecifyText from 'components/Pipelines/SpecifyText';
import React, { useEffect, useState } from 'react';

const Pipelines = () => {
    const [text, setText] = useState('');
    const [latestStep, setLatestStep] = useState(1);
    const [triples, setTriples] = useState([]);

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

    return (
        <div>
            <SpecifyText text={text} setText={setText} />
            <ConfigurePipeline text={text} latestStep={latestStep} setLatestStep={setLatestStep} setTriples={setTriples} />
            <Output triples={triples} latestStep={latestStep} />
        </div>
    );
};

export default Pipelines;
