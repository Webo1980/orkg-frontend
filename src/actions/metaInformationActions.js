import * as type from './types';

export const updateMetaInformationStore = data => dispatch => {
    dispatch({
        type: type.SAVE_META_INFORMATION,
        payload: {
            statements: data
        }
    });
};
export const updateMetaInformationAuthors = data => dispatch => {
    dispatch({
        type: type.SAVE_AUTHOR_ORCID,
        payload: {
            statements: data
        }
    });
};

export const resetMetaInformationStore = data => dispatch => {
    dispatch({
        type: type.RESET_META_INFORMATION_STORE,
        payload: {}
    });
};
