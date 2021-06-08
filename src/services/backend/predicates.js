import { submitPostRequest, submitPutRequest, submitGetRequest } from 'network';
import queryString from 'query-string';
import { url } from 'constants/misc';
import UserService from '../../components/Authentication/UserService';
export const predicatesUrl = `${url}predicates/`;

export const getPredicate = id => {
    return submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);
};

export const createPredicate = label => {
    const token = UserService.getToken();
    return submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, { label: label });
};

export const updatePredicate = (id, label) => {
    const token = UserService.getToken();
    return submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, { label: label });
};

export const getPredicates = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exact = false,
    returnContent = false
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page, size, sort, exact, ...(q ? { q } : {}) },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );

    return submitGetRequest(`${predicatesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};
