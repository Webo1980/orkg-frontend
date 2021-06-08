import { url } from 'constants/misc';
import { ENTITIES } from 'constants/graphSettings';
import { getClasses, getClassById } from './classes';
import { getPredicates, getPredicate } from './predicates';
import { getResources, getResource } from './resources';
import { submitGetRequest, submitPostRequest } from 'network';
import UserService from '../../components/Authentication/UserService';
export const doisUrl = `${url}dois/`;

export const getPaperByDOI = doi => {
    return submitGetRequest(`${url}widgets/?doi=${doi}`);
};

export const generateDOIForComparison = (comparison_id, title, subject, description, related_resources, authors, url) => {
    const token = UserService.getToken();
    return submitPostRequest(
        doisUrl,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        { comparison_id, title, subject, description, related_resources, authors, url }
    );
};

export const createObject = payload => {
    const token = UserService.getToken();
    return submitPostRequest(`${url}objects/`, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, payload);
};

export const getEntities = (entityType, params) => {
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

export const getEntity = (entityType, id) => {
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
