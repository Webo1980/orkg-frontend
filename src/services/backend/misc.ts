import { url } from 'constants/misc';
import { ENTITIES } from 'constants/graphSettings';
import { submitGetRequest, submitPostRequest } from 'network';
import { getClasses, getClassById } from 'services/backend/classes';
import { getPredicates, getPredicate } from 'services/backend/predicates';
import { getResources, getResource } from 'services/backend/resources';
import { Resource } from 'services/backend/types';

export const doisUrl = `${url}dois/`;

export const getPaperByDOI = (doi: string) => submitGetRequest(`${url}widgets/?doi=${doi}`);

export const getPaperByTitle = (title: string) => submitGetRequest(`${url}widgets/?title=${title}`);

export const generateDoi = ({
    type,
    resource_type,
    resource_id,
    title,
    subject,
    description,
    related_resources = [],
    authors = [],
    url,
}: Resource): Promise<Resource> =>
    submitPostRequest(
        doisUrl,
        { 'Content-Type': 'application/json' },
        { type, resource_type, resource_id, title, subject, description, related_resources, authors, url },
    );

export const createObject = (payload: string) => submitPostRequest(`${url}objects/`, { 'Content-Type': 'application/json' }, payload);

export const getEntities = (entityType: any, params: any) => {
    // { page = 0, items: size = 9999, sortBy = 'created_at', desc = true, q = null, exact = false, returnContent = false }
    // for resources there additional parameter: exclude
    // for resources there additional parameter: uri
    switch (entityType) {
        case ENTITIES.RESOURCE:
            return getResources(params);
        case ENTITIES.PREDICATE:
            return getPredicates(params);
        case ENTITIES.CLASS:
            return getClasses(params);
        default:
            return getResources(params);
    }
};

/**
 * Get entity by ID
 *
 * @param {String} entityType - Entity Type
 * @param {String} id - Entity ID
 * @return {Promise} Promise object
 */
export const getEntity = (entityType: string = ENTITIES.RESOURCE, id: string): Promise<any> => {
    switch (entityType) {
        case ENTITIES.RESOURCE:
            return getResource(id);
        case ENTITIES.PREDICATE:
            return getPredicate(id);
        case ENTITIES.CLASS:
            return getClassById(id);
        default:
            return getResource(id);
    }
};
