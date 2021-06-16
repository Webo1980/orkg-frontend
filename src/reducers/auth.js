import * as type from 'actions/types';

const initialState = {
    user: 0 // possible values: 0 (to differentiate first load from non-signedin but stay falsy), null (non signedin), or object (signedin)
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.UPDATE_AUTH:
            return {
                ...state,
                ...action.payload
            };
        case type.RESET_AUTH:
            return {
                ...state,
                user: null // ensure user is null (signedout) not 0 (first load)
            };

        default: {
            return state;
        }
    }
};
