/**
 * Services file for the NLP pipeline service
 */

import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const pipelineUrl = env('PIPELINE_URL');

export const getComponents = () => {
    return submitGetRequest(`${pipelineUrl}components/`);
};

export const getPipelines = () => {
    return submitGetRequest(`${pipelineUrl}pipelines/`);
};
