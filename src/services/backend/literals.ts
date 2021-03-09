import { url } from 'constants/misc';
import { submitPostRequest, submitPutRequest } from 'network';
import { MISC } from 'constants/graphSettings';

export const literalsUrl = `${url}literals/`;

export interface Literal {
    id: string;
    label: string;
    datatype: string;
    created_at: string;
    created_by: string;
    _class: 'literal';
}

export const updateLiteral = (id: string, label: string): Promise<Literal> => {
    return submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label });
};

export const createLiteral = (label: string, datatype: string = MISC.DEFAULT_LITERAL_DATATYPE): Promise<Literal> => {
    return submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label, datatype });
};
