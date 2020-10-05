import * as type from '../actions/types';

const initialState = {
    metaInformationStore: {},
    authorsOrcidStore: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.SAVE_META_INFORMATION: {
            return { ...state, metaInformationStore: { statements: [...action.payload.statements] } };
        }
        case type.SAVE_AUTHOR_ORCID: {
            return { ...state, authorsOrcidStore: { statements: [...action.payload.statements] } };
        }
        case type.RESET_META_INFORMATION_STORE: {
            return initialState;
        }
        default: {
            return state;
        }
    }
};
