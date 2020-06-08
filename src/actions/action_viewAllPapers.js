import * as type from './types.js';

export const appendAtEnd = statements => dispatch => {
    dispatch({
        type: type.ADD_ENDING_STATEMENTS,
        payload: statements
    });
};

export const appendAtFront = statements => dispatch => {
    dispatch({
        type: type.ADD_BEGINNING_STATEMENTS,
        payload: statements
    });
};

export const addLoadedPapers = papers => dispatch => {
    dispatch({
        type: type.ADD_LOADED_PAPERS,
        payload: papers
    });
};
