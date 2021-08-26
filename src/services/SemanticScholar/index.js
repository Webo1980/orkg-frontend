import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const getSimilarPapers = researchProblem => {
    return submitGetRequest(`
    ${env('SEMANTICSCHOLAR_API_URL')}paper/search?query=${researchProblem}&limit=3&fields=title,authors,externalIds,citationCount,abstract,year`);
};
