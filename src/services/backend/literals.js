import { url } from 'constants/misc';
import { submitPostRequest, submitPutRequest } from 'network';
import { MISC } from 'constants/graphSettings';
import UserService from '../../components/Authentication/UserService';
export const literalsUrl = `${url}literals/`;

export const updateLiteral = (id, label) => {
    const token = UserService.getToken();
    return submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, { label: label });
};

export const createLiteral = (label, datatype = MISC.DEFAULT_LITERAL_DATATYPE) => {
    const token = UserService.getToken();
    return submitPostRequest(
        literalsUrl,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        { label: label, datatype: datatype }
    );
};
