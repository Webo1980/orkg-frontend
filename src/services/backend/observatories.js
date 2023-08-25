import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest, submitDeleteRequest, submitPatchRequest } from 'network';
import qs from 'qs';
import { getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';

export const observatoriesUrl = `${url}observatories/`;

/**
 * Get Observatories (400 BAD REQUEST if both q and research_field are specified)
 * @param {String} researchFieldId Research field id
 * @param {String} q Search query
 * @param {Number} page Page number
 * @param {Number} size Number of items per page
 * @return {Object} List of observatories
 */
export const getObservatories = ({ researchFieldId = null, q = null, page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { research_field: researchFieldId ? encodeURIComponent(researchFieldId) : null, q, page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}?${params}`);
};

export const getResearchFieldOfObservatories = ({ page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}research-fields/?${params}`);
};

export const getObservatoryById = id => submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/`);

export const updateObservatoryName = (id, value) =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/name`, { 'Content-Type': 'application/json' }, { value });

export const updateObservatoryDescription = (id, value) =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/description`, { 'Content-Type': 'application/json' }, { value });

export const updateObservatoryResearchField = (id, value) =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/research_field`, { 'Content-Type': 'application/json' }, { value });

export const getUsersByObservatoryId = ({ id, page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/users?${params}`);
};

export const addOrganizationToObservatory = (id, organization_id) =>
    submitPutRequest(`${observatoriesUrl}add/${encodeURIComponent(id)}/organization`, { 'Content-Type': 'application/json' }, { organization_id });

export const deleteOrganizationFromObservatory = (id, organization_id) =>
    submitPutRequest(`${observatoriesUrl}delete/${encodeURIComponent(id)}/organization`, { 'Content-Type': 'application/json' }, { organization_id });

export const getContentByObservatoryIdAndClasses = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    classes = [],
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort, visibility, classes: classes.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/class?${params}`);
};

export const getPapersByObservatoryIdAndFilters = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    filters = [],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort, visibility, filterConfig: JSON.stringify(filters) },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/papers?${params}`);
};

export const createObservatory = (observatory_name, organization_id, description, research_field, display_id) =>
    submitPostRequest(
        observatoriesUrl,
        { 'Content-Type': 'application/json' },
        { observatory_name, organization_id, description, research_field, display_id },
    );

export const getObservatoryAndOrganizationInformation = (observatoryId, organizationId) => {
    if (observatoryId && observatoryId !== MISC.UNKNOWN_ID) {
        return getObservatoryById(observatoryId)
            .then(obsResponse => {
                if (organizationId !== MISC.UNKNOWN_ID) {
                    return getOrganization(organizationId)
                        .then(orgResponse => ({
                            id: observatoryId,
                            name: obsResponse.name,
                            display_id: obsResponse.display_id,
                            organization: {
                                id: organizationId,
                                name: orgResponse.name,
                                logo: getOrganizationLogoUrl(orgResponse.id),
                                display_id: orgResponse.display_id,
                                type: orgResponse.type,
                            },
                        }))
                        .catch(() => ({
                            id: observatoryId,
                            name: obsResponse.name,
                            display_id: obsResponse.display_id,
                            organization: null,
                        }));
                }
                return {
                    id: observatoryId,
                    name: obsResponse.name,
                    display_id: obsResponse.display_id,
                    organization: null,
                };
            })
            .catch(() => Promise.resolve(null));
    }
    if (organizationId && organizationId !== MISC.UNKNOWN_ID) {
        return getOrganization(organizationId)
            .then(orgResponse => ({
                id: null,
                name: null,
                display_id: null,
                organization: {
                    id: organizationId,
                    name: orgResponse.name,
                    logo: getOrganizationLogoUrl(orgResponse.id),
                    display_id: orgResponse.display_id,
                    type: orgResponse.type,
                },
            }))
            .catch(() => Promise.resolve(null));
    }
    return Promise.resolve(null);
};

/**
 * Get the list of filters for the observatory
 *
 * @param {String} id observatory id
 * @return {Array} List of filters
 */
export const getFiltersByObservatoryId = ({ id, page = 0, items = 9999, sortBy = 'featured', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/filters/?${params}`);
};

/**
 * create filter in observatory
 */
export const createFiltersInObservatory = (id, { label, path, range, featured }) =>
    submitPostRequest(
        `${observatoriesUrl}${encodeURIComponent(id)}/filters/`,
        { 'Content-Type': 'application/json' },
        { label, path, range, featured },
    );

/**
 * update filter in observatory
 */
export const updateFiltersOfObservatory = (observatoryId, filterId, { label, path, range, featured }) =>
    submitPatchRequest(
        `${observatoriesUrl}${encodeURIComponent(observatoryId)}/filters/${filterId}`,
        { 'Content-Type': 'application/json' },
        { label, path, range, featured },
    );

/**
 * Delete a filter from an observatory
 *
 * @param {String} observatoryId observatory id
 * @param {String} filterId filter id
 */
export const deleteFilterOfObservatory = (observatoryId, filterId) =>
    submitDeleteRequest(`${observatoriesUrl}${encodeURIComponent(observatoryId)}/filters/${filterId}`);
