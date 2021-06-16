import Keycloak from 'keycloak-js';
import env from '@beam-australia/react-env';

const keyInstance = new Keycloak({
    url: env('KEYCLOAK_AUTH_SERVER_URL'),
    realm: env('KEYCLOAK_REALM'),
    clientId: env('KEYCLOAK_CLIENT_ID')
});

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = onAuthenticatedCallback => {
    keyInstance
        .init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri:
                window.location.origin + env('PUBLIC_URL') + `${env('PUBLIC_URL').endsWith('/') ? '' : '/'}silent-check-sso.html`,
            pkceMethod: 'S256'
        })
        .then(() => {
            onAuthenticatedCallback();
        });
};

/* Redirects to login form on (options is an optional object with redirectUri and/or prompt fields). */
const doLogin = keyInstance.login;

/* Redirects to logout. */
const doLogout = keyInstance.logout;

/* The base64 encoded token that can be sent in the Authorization header in requests to services. */
const getToken = () => keyInstance.token;

const isLoggedIn = () => !!keyInstance.token;

/* If the token expires within minValidity seconds (minValidity is optional, if not specified 5 is used) the token is refreshed. If the session status iframe is enabled, the session status is also checked. */
const updateToken = successCallback =>
    keyInstance
        .updateToken(5)
        .then(successCallback)
        .catch(doLogin);

const getUsername = () => keyInstance.tokenParsed?.preferred_username;

const hasRole = roles => roles.some(role => keyInstance.hasRealmRole(role));

const getKeycloakInstance = () => keyInstance;

/* Redirects to the Account Management Console */
const doAccountManagement = keyInstance.accountManagement;

const UserService = {
    initKeycloak,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getUsername,
    hasRole,
    getKeycloakInstance,
    doAccountManagement
};

export default UserService;
