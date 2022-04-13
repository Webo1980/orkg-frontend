import UserService from 'userService';

const addTokenToHeader = (header, send_token) => {
    if (send_token) {
        if (UserService.isLoggedIn()) {
            const cb = () => {
                header.append('Authorization', `Bearer ${UserService.getToken()}`);
                return Promise.resolve(header);
            };
            return UserService.updateToken(cb);
        }
    }
    return Promise.resolve(header);
};

export const submitGetRequest = (url, headers, send_token = false) => {
    if (!url) {
        throw new Error('Cannot submit GET request. URL is null or undefined.');
    }
    const header = headers ? new Headers(headers) : {};
    return addTokenToHeader(header, send_token).then(myHeaders => {
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
    });
};

export const submitPostRequest = (url, headers, data, jsonStringify = true, send_token = true) => {
    if (!url) {
        throw new Error('Cannot submit POST request. URL is null or undefined.');
    }

    const header = new Headers(headers);
    if (jsonStringify) {
        data = JSON.stringify(data);
    }

    return addTokenToHeader(header, send_token).then(myHeaders => {
        return new Promise((resolve, reject) => {
            fetch(url, { method: 'POST', headers: myHeaders, body: data })
                .then(response => {
                    if (!response.ok) {
                        const json = response.json();
                        if (json.then) {
                            return json.then(reject);
                        } else {
                            return reject({
                                error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                                statusCode: response.status,
                                statusText: response.statusText
                            });
                        }
                    } else {
                        const json = response.json();
                        if (json.then) {
                            json.then(resolve).catch(reject);
                        } else {
                            const json = response.json();
                            if (json.then) {
                                json.then(resolve).catch(reject);
                            } else {
                                return resolve(json);
                            }
                        }
                    }
                })
                .catch(reject);
        });
    });
};

export const submitPutRequest = (url, headers, data, jsonStringify = true) => {
    if (!url) {
        throw new Error('Cannot submit PUT request. URL is null or undefined.');
    }

    const header = new Headers(headers);

    if (jsonStringify) {
        data = JSON.stringify(data);
    }

    return addTokenToHeader(header, true).then(myHeaders => {
        return new Promise((resolve, reject) => {
            fetch(url, { method: 'PUT', headers: myHeaders, body: data })
                .then(response => {
                    if (!response.ok) {
                        const json = response.json();
                        if (json.then) {
                            return json.then(reject);
                        } else {
                            return reject({
                                error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                                statusCode: response.status,
                                statusText: response.statusText
                            });
                        }
                    } else {
                        if (response.status === 204) {
                            // HTTP 204 No Content success status
                            return resolve();
                        } else {
                            const json = response.json();
                            if (json.then) {
                                json.then(resolve).catch(reject);
                            } else {
                                return resolve(json);
                            }
                        }
                    }
                })
                .catch(reject);
        });
    });
};

export const submitDeleteRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit DELETE request. URL is null or undefined.');
    }

    const header = new Headers(headers);

    return addTokenToHeader(header, true).then(myHeaders => {
        return new Promise((resolve, reject) => {
            fetch(url, { method: 'DELETE', headers: myHeaders, body: JSON.stringify(data) })
                .then(response => {
                    if (!response.ok) {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    } else {
                        return resolve();
                    }
                })
                .catch(reject);
        });
    });
};
