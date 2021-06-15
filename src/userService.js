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
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            pkceMethod: 'S256'
        })
        .then(authenticated => {
            onAuthenticatedCallback();
        });
};

const doLogin = keyInstance.login;

const doLogout = keyInstance.logout;

const getToken = () => keyInstance.token;

const isLoggedIn = () => !!keyInstance.token;

const updateToken = successCallback =>
    keyInstance
        .updateToken(5)
        .then(successCallback)
        .catch(doLogin);

const getUsername = () => keyInstance.tokenParsed?.preferred_username;

const hasRole = roles => roles.some(role => keyInstance.hasRealmRole(role));

const getKeycloakInstance = () => keyInstance;

const UserService = {
    initKeycloak,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getUsername,
    hasRole,
    getKeycloakInstance
};

export default UserService;
