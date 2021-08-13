import { submitGetRequest } from 'network';

export const getPapersCitations = input => {
    return submitGetRequest(`https://opencitations.net/index/coci/api/v1/citation-count/${input}`);
};
