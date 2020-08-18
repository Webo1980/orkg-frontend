import * as type from '../actions/types';

const initialState = {
    contributionStatementStore: {},
    metaInformationStore: {},
    authorsOrcidStore: {},
    blockUpdates: false
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

        case type.SB_BLOCK_UPDATES: {
            return { ...state, blockUpdates: action.payload.blocked };
        }

        default: {
            return state;
        }
    }
};
