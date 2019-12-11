import { Cookies } from 'react-cookie';
import queryString from 'query-string';
export const url = `${process.env.REACT_APP_SERVER_URL}api/`;
export const similaireServiceUrl = process.env.REACT_APP_SIMILARITY_SERVICE_URL;
export const annotationServiceUrl = process.env.REACT_APP_ANNOTATION_SERVICE_URL;
export const resourcesUrl = `${url}resources/`;
export const predicatesUrl = `${url}predicates/`;
export const statementsUrl = `${url}statements/`;
export const literalsUrl = `${url}literals/`;
export const classesUrl = `${url}classes/`;
export const statsUrl = `${url}stats/`;
export const crossrefUrl = process.env.REACT_APP_CROSSREF_URL;
export const arxivUrl = process.env.REACT_APP_ARXIV_URL;
export const semanticScholarUrl = process.env.REACT_APP_SEMANTICSCHOLAR_URL;
export const comparisonUrl = `${similaireServiceUrl}compare/`;
export const similaireUrl = `${similaireServiceUrl}similar/`;
export const authenticationUrl = process.env.REACT_APP_SERVER_URL;

/**
 * Sends simple GET request to the URL.
 */
export const submitGetRequest = (url, headers, send_token = true) => {
    if (!url) {
        throw new Error('Cannot submit GET request. URL is null or undefined.');
    }

    let myHeaders = new Headers(headers);

    if (send_token) {
        const cookies = new Cookies();
        let token = cookies.get('token') ? cookies.get('token') : null;
        if (token) {
            myHeaders.append('Authorization', `Bearer ${token}`);
        }
    }

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: myHeaders
        })
            .then(response => {
                if (!response.ok) {
                    reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText
                    });
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

const submitPostRequest = (url, headers, data, jsonStringify = true, send_token = true) => {
    if (!url) {
        throw new Error('Cannot submit POST request. URL is null or undefined.');
    }

    let myHeaders = new Headers(headers);

    if (send_token) {
        const cookies = new Cookies();
        let token = cookies.get('token') ? cookies.get('token') : null;
        if (token) {
            myHeaders.append('Authorization', `Bearer ${token}`);
        }
    }

    if (jsonStringify) {
        data = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'POST', headers: myHeaders, body: data })
            .then(response => {
                if (!response.ok) {
                    const json = response.json();
                    if (json.then) {
                        json.then(reject);
                    } else {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    }
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

const submitPutRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit PUT request. URL is null or undefined.');
    }

    const cookies = new Cookies();
    let token = cookies.get('token') ? cookies.get('token') : null;
    let myHeaders = new Headers(headers);
    if (token) {
        myHeaders.append('Authorization', `Bearer ${token}`);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'PUT', headers: myHeaders, body: JSON.stringify(data) })
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

const submitDeleteRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit DELETE request. URL is null or undefined.');
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'DELETE', headers: headers, body: JSON.stringify(data) })
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                } else {
                    return resolve();
                }
            })
            .catch(reject);
    });
};

export const updateResource = (id, label) => {
    return submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const updateLiteral = (id, label) => {
    return submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const updatePredicate = (id, label) => {
    return submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResource = (label, classes = []) => {
    return submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label, classes });
};

export const createLiteral = label => {
    return submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResourceStatement = (subjectId, predicateId, objectId) => {
    return submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object: {
                id: objectId,
                _class: 'resource'
            }
        }
    );
};

export const createLiteralStatement = (subjectId, predicateId, property) => {
    return submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object: {
                id: property,
                _class: 'literal'
            }
        }
    );
};

export const updateStatement = (id, { subject_id = null, predicate_id = null, object_id = null }) => {
    return submitPutRequest(
        `${statementsUrl}${id}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id: subject_id } : null),
            ...(predicate_id ? { predicate_id: predicate_id } : null),
            ...(object_id ? { object_id: object_id } : null)
        }
    );
};

export const updateStatements = (statementIds, { subject_id = null, predicate_id = null, object_id = null }) => {
    return submitPutRequest(
        `${statementsUrl}?ids=${statementIds.join()}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id: subject_id } : null),
            ...(predicate_id ? { predicate_id: predicate_id } : null),
            ...(object_id ? { object_id: object_id } : null)
        }
    );
};

export const createPredicate = label => {
    return submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const getPredicate = id => {
    return submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);
};

export const getResource = id => {
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);
};

export const getAllResources = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null, exclude = null }) => {
    let params = queryString.stringify({
        page: page,
        items: items,
        sortBy: sortBy,
        desc: desc,
        ...(q ? { q: q } : {}),
        ...(exclude ? { exclude: exclude } : {})
    });

    return submitGetRequest(`${resourcesUrl}?${params}`);
};

export const getAllPredicates = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc, ...(q ? { q: q } : {}) });

    return submitGetRequest(`${predicatesUrl}?${params}`);
};

export const getAllStatements = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}?${params}`);
};

export const getPredicatesByLabel = label => {
    return submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};

export const deleteStatementById = id => {
    return submitDeleteRequest(statementsUrl + encodeURIComponent(id));
};

export const deleteStatementsByIds = ids => {
    return submitDeleteRequest(`${statementsUrl}?ids=${ids.join()}`);
};

export const getStatementsBySubject = ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}subject/${encodeURIComponent(id)}/?${params}`);
};

export const getStatementsBySubjects = ({ ids, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    let params = queryString.stringify({ ids: ids.join(), page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}subjects/?${params}`);
};

export const getStatementsByObject = async ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    let statements = await submitGetRequest(`${statementsUrl}object/${encodeURIComponent(id)}/?${params}`);

    return statements;
};

export const getResourcesByClass = async ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc, ...(q ? { q: q } : {}) });

    let resources = await submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/resources/?${params}`);

    return resources;
};

export const getStatementsByPredicate = ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/?${params}`);
};

export const getSimilaireContribution = id => {
    return submitGetRequest(`${similaireUrl}${encodeURIComponent(id)}/`);
};

export const getAnnotations = abstract => {
    return submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });
};

export const indexContribution = contribution_id => {
    return fetch(`${similaireServiceUrl}internal/index/${encodeURIComponent(contribution_id)}/`, {
        method: 'GET'
    });
};

export const getStats = () => {
    return submitGetRequest(statsUrl);
};

export const createShortLink = data => {
    return submitPostRequest(`${similaireServiceUrl}shortener/`, { 'Content-Type': 'application/json' }, data);
};

export const getLongLink = shortCode => {
    return submitGetRequest(`${similaireServiceUrl}shortener/${encodeURIComponent(shortCode)}/`);
};

export const getAllClasses = () => {
    return submitGetRequest(classesUrl);
};

export const saveFullPaper = data => {
    return submitPostRequest(`${url}papers/`, { 'Content-Type': 'application/json' }, data);
};

export const signInWithEmailAndPassword = async (email, password) => {
    // because of the spring oauth implementation, these calls don't send json
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic b3JrZy1jbGllbnQ6c2VjcmV0'
    };

    const data = {
        username: email,
        grant_type: 'password',
        client_id: 'orkg-client',
        password
    };

    const formBody = Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

    return submitPostRequest(`${authenticationUrl}oauth/token`, headers, formBody, false, false);

    /*//TODO: use this setup also in submitPostRequest, and remove the code from there
  //difference here is that a json is parsed, no matter whether response.ok is true or not
  try {
    const response = await fetch(`${authenticationUrl}oauth/token`,
      {
        headers: headers,
        method: 'POST',
        body: formBody,
      }
    );
    const json = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json;
    
  } catch (error) {
    throw error;
  }*/
};

export const registerWithEmailAndPassword = (email, password, matching_password, name) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const data = {
        display_name: name,
        email: email,
        password: password,
        matching_password: matching_password
    };

    return submitPostRequest(`${authenticationUrl}auth/register`, headers, data, true, false);
};

export const getUserInformation = () => {
    return submitGetRequest(`${authenticationUrl}user/`);
};

export const updateUserInformation = ({ email, displayName }) => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        //email, //back doesn't support this
        display_name: displayName
    };

    return submitPutRequest(`${authenticationUrl}user/`, headers, data);
};

export const updateUserPassword = ({ password, newPassword, confirmNewPassword }) => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        password: newPassword,
        matching_password: confirmNewPassword
    };

    return submitPutRequest(`${authenticationUrl}user/`, headers, data);
};
