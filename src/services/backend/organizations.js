import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import UserService from '../../components/Authentication/UserService';
export const organizationsUrl = `${url}organizations/`;

export const getAllOrganizations = () => {
    return submitGetRequest(`${organizationsUrl}`);
};

export const getOrganization = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
};

export const createOrganization = (organizationName, organizationLogo, createdBy, url) => {
    const token = UserService.getToken();
    return submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        { organizationName, organizationLogo, createdBy, url }
    );
};

export const updateOrganizationName = (id, value) => {
    const token = UserService.getToken();
    return submitPutRequest(
        `${organizationsUrl}${encodeURIComponent(id)}/name`,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        { value }
    );
};

export const updateOrganizationUrl = (id, value) => {
    const token = UserService.getToken();
    return submitPutRequest(
        `${organizationsUrl}${encodeURIComponent(id)}/url`,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        { value }
    );
};

export const updateOrganizationLogo = (id, value) => {
    const token = UserService.getToken();
    return submitPutRequest(
        `${organizationsUrl}${encodeURIComponent(id)}/logo`,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        { value }
    );
};

export const getAllObservatoriesByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);
};

export const getUsersByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);
};
