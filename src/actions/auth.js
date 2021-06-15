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
                dispatch(
                    updateAuth({
                        user: {
                            displayName: keycloakInstance.idTokenParsed.name,
                            id: keycloakInstance.idTokenParsed.sub,
                            token: keycloakInstance.idToken,
                            tokenExpire: keycloakInstance.tokenParsed.exp,
                            email: keycloakInstance.idTokenParsed.email
                            //isCurationAllowed: true
                        }
                    })
                );
            } else {
                dispatch({
                    type: type.RESET_AUTH
                });
            }
        }
        return Promise.resolve();
    };
}
