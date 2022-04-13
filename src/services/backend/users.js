import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const userUrl = `${url}user/`;
export const authenticationUrl = env('BACKEND_URL');

export const getUserInformation = () => {
    return submitGetRequest(`${userUrl}`, {}, true);
};

export const getUserInformationById = userId => {
    return submitGetRequest(`${userUrl}` + userId, {}, true);
};
