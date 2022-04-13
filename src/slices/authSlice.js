import { createSlice } from '@reduxjs/toolkit';
import UserService from 'userService';

const initialState = {
    user: 0 // possible values: 0 (to differentiate first load from non-signedin but stay falsy), null (non signedin), or object (signedin)
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAuth: (state, { payload }) => {
            return {
                ...state,
                ...payload
            };
        },
        resetAuth: state => {
            state.user = null; // ensure user is null (signedout) not 0 (first load)
        }
    }
});

export const { updateAuth, resetAuth } = authSlice.actions;

export default authSlice.reducer;

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
                            //isCurationAllowed: userData.is_curation_allowed
                        }
                    })
                );
            } else {
                dispatch(resetAuth());
            }
        }
        return Promise.resolve();
    };
}
