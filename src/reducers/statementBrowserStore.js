import * as type from '../actions/types';

const initialState = {
    contributionStatementStore: {},
    metaInformationStore: {},
    authorsOrcidStore: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.SB_SAVE_STATEMENT_BROWSER: {
            const propertyName = action.payload.contributionId;
            if (propertyName) {
                const contributionStore = state.contributionStatementStore;
                contributionStore[propertyName] = action.payload.store;
                return {
                    ...state,
                    contributionStatementStore: contributionStore
                };
            }
            // fallback when no id is given
            return state;
        }
        case type.SB_SAVE_META_INFORMATION: {
            return { ...state, metaInformationStore: { statements: [...action.payload.statements] } };
        }
        case type.SB_SAVE_AUTHOR_ORCID: {
            return { ...state, authorsOrcidStore: { statements: [...action.payload.statements] } };
        }
        case type.SB_LOAD_CONTRIBUTION_DATA: {
            console.log('>> this is a loading info ', action.payload);
            // todo : send request
            return state;
        }

        default: {
            return state;
        }
    }
};
