import { url } from 'constants/misc';
import { submitPostRequest, submitPutRequest } from 'network';
import { MISC } from 'constants/graphSettings';

export const literalsUrl: string = `${url}literals/`;

export const updateLiteral = (id: string, label: string, datatype: undefined = undefined) =>
    submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label, datatype });

export const createLiteral = (label: string, datatype = MISC.DEFAULT_LITERAL_DATATYPE) =>
    submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label, datatype });
