/**
 * Services file for the NLP pipeline service
 */

import { submitGetRequest, submitPostRequest } from 'network';
import env from '@beam-australia/react-env';

export const pipelineUrl = env('PIPELINE_URL');

export const getComponents = () => submitGetRequest(`${pipelineUrl}components/`);

export const getPipelines = () => submitGetRequest(`${pipelineUrl}pipelines/`);

export const runPipeline = ({ extractors, linkers, resolvers, inputText }) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const data = {
        extractor: extractors,
        linker: linkers,
        resolver: resolvers,
        input_text: inputText
    };

    return submitPostRequest(`${pipelineUrl}run/`, headers, data);
};
