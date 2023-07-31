import { url as backendURL } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest, submitPatchRequest } from 'network';

export const organizationsUrl = `${backendURL}organizations/`;

export const getAllOrganizations = () => submitGetRequest(`${organizationsUrl}`);

export const getOrganization = (id: string) => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
export const getOrganizationLogoUrl = (id: string) => `${organizationsUrl}${encodeURIComponent(id)}/logo`;
export const createOrganization = (
    organization_name: string,
    organization_logo: string,
    created_by: any,
    url: string,
    display_id: string,
    type: string | undefined,
) =>
    submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json' },
        { organization_name, organization_logo, created_by, url, display_id, type },
    );

export const updateOrganization = (
    id: string,
    { name, url, type, logo }: { name: string; url: string; type: string; logo: string },
): Promise<void> => {
    const formData = new FormData();
    if (logo) formData.append('logo', logo);
    if (name || url || type) {
        const _properties: { [key: string]: string } = {};
        if (name) _properties.name = name;
        if (url) _properties.url = url;
        if (type) _properties.type = type;
        formData.append(
            'properties',
            new Blob([JSON.stringify(_properties)], {
                type: 'application/json',
            }),
        );
    }
    return submitPatchRequest(`${organizationsUrl}${encodeURIComponent(id)}`, {}, formData, false);
};

export const updateOrganizationType = (id: string, value: string) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/type`, { 'Content-Type': 'application/json' }, { value });

export const updateConferenceDate = (id: string, value: string) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/date`, { 'Content-Type': 'application/json' }, { value });

export const updateConferenceProcess = (id: string, value: string) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/process`, { 'Content-Type': 'application/json' }, { value });

export const getAllObservatoriesByOrganizationId = (id: string) => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);

export const getUsersByOrganizationId = (id: string) => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);

export const getComparisonsByOrganizationId = (id: string, page: number, size: number = 10) =>
    submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/comparisons/?page=${page}&size=${size}`);

export const getConferences = () => submitGetRequest(`${organizationsUrl}conferences`);

export const getProblemsByOrganizationId = (id: string) => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/problems`);
