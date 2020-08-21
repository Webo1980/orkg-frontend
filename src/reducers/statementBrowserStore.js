import * as type from '../actions/types';

const initialState = {
    contributionStatementStore: {},
    selectedStore: undefined,
    metaInformationStore: {},
    authorsOrcidStore: {},
    blockUpdates: false,
    readOnlyStore: {}
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
                    contributionStatementStore: contributionStore,
                    selectedStore: propertyName
                };
            }
            // fallback when no id is given
            return state;
        }

        case type.SB_RESTORE_SELECTED_STORE_ID: {
            const propertyName = action.payload.storeId;
            console.log('RESTORING ID', propertyName);
            if (propertyName) {
                return {
                    ...state,
                    selectedStore: propertyName
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
        case type.SB_RESET_STATEMENT_BROWSER_STORE: {
            // requires manual overwrite of the store
            return {
                contributionStatementStore: {},
                selectedStore: undefined,
                metaInformationStore: {},
                authorsOrcidStore: {},
                blockUpdates: false
            };
        }

        default: {
            return state;
        }
    }
};
