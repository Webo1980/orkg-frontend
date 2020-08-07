import * as type from 'actions/types';

/** ---action functions **/

export const updateStatementStore = data => dispatch => {
    dispatch({
        type: type.SB_SAVE_STATEMENT_BROWSER,
        payload: {
            store: data.store,
            contributionId: data.contributionId
        }
    });
};
export const updateMetaInformationStore = data => dispatch => {
    dispatch({
        type: type.SB_SAVE_META_INFORMATION,
        payload: {
            statements: data
        }
    });
};
export const updateMetaInformationAuthors = data => dispatch => {
    dispatch({
        type: type.SB_SAVE_AUTHOR_ORCID,
        payload: {
            statements: data
        }
    });
};
