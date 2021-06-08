import * as type from './types';
import UserService from 'components/Authentication/UserService';

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
        return dispatch(
            updateAuth({
                displayName: '',
                id: '',
                token: '',
                tokenExpire: '',
                email: '',
                isCurationAllwed: 'true'
            })
        );
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
