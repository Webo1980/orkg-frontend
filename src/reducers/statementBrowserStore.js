import * as type from '../actions/types';

const initialState = {
    contributionStatementStore: {}
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
        default: {
            return state;
        }
    }
};
