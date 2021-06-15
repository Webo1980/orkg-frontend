import * as type from './types';
import UserService from 'userService';

export const updateAuth = payload => dispatch => {
    dispatch({
        type: type.UPDATE_AUTH,
        payload
    });
};

export const resetAuth = () => dispatch => {
    dispatch({
        type: type.RESET_AUTH
    });
};

export function firstLoad() {
    return dispatch => {
        if (UserService.isLoggedIn) {
            const keycloakInstance = UserService.getKeycloakInstance();
            if (keycloakInstance.idTokenParsed) {
                this.signInRequired = false;
                return dispatch(
                    updateAuth({
                        user: {
                            displayName: keycloakInstance.idTokenParsed.name,
                            id: keycloakInstance.idTokenParsed.sub,
                            token: keycloakInstance.idToken,
                            tokenExpire: keycloakInstance.tokenParsed.exp,
                            email: keycloakInstance.idTokenParsed.email
                        }
                    })
                )
                    .catch(error => {
                        dispatch({
                            type: type.RESET_AUTH
                        });
                    })
                    .then(() => Promise.resolve());
            }
        }
        return Promise.resolve();
    };
}

export const openAuthDialog = ({ action, signInRequired = false, redirectRoute = null }) => dispatch => {
    dispatch({
        type: type.OPEN_AUTHENTICATION_DIALOG,
        payload: {
            action,
            signInRequired,
            redirectRoute
        }
    });
};

export const toggleAuthDialog = () => dispatch => {
    dispatch({
        type: type.TOGGLE_AUTHENTICATION_DIALOG
    });
};
