/**
 * Services file for the annotation service
 * https://gitlab.com/TIBHannover/orkg/annotation
 */

import { submitPostRequest, submitPutRequest } from 'network';
import env from '@beam-australia/react-env';

export const annotationServiceUrl = env('ANNOTATION_SERVICE_URL');

interface GetAnnotationsResponse {
    entities: [string, string, [number, number], number, null][];
    text: string;
    time: number;
}

export const getAnnotations = (abstract: string): Promise<GetAnnotationsResponse> =>
    submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });

interface ClassifySentence {
    sentence: string;
    labels: String[];
}

interface ClassifySentenceResponse {
    labels: string[];
    scores: number[];
    sequence: string;
}

export const classifySentence = ({ sentence, labels }: ClassifySentence): Promise<ClassifySentenceResponse> => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const data = {
        sentence,
        labels
    };

    return submitPutRequest(`${annotationServiceUrl}classifySentence/`, headers, data);
};

interface SummarizeText {
    text: string;
    ratio: number;
}

interface SummarizeTextResponse {
    summary: string;
}

export const summarizeText = ({ text, ratio }: SummarizeText): Promise<SummarizeTextResponse> => {
    const headers = {
        'Content-Type': 'text/plain'
    };

    return submitPutRequest(`${annotationServiceUrl}summarizeText/?ratio=${ratio}`, headers, text, false);
};
