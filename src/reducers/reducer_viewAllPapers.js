import * as type from '../actions/types';

/** This reducer has a state that holds two arrays :
 *
 * loadedPapers :  Array for the paper resources, it has ids and the labels of the papers,
 * these are used to directly render the paper cards with indicators
 *
 * loadedStatements : Array for statements of individual paper resources,
 * holds authors etc. used to render the content of paperCards
 * **/

const initialState = {
    loadedStatements: [],
    loadedPapers: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.ADD_BEGINNING_STATEMENTS: {
            const newState = { ...state };
            newState.loadedStatements = [...action.payload, ...newState.loadedStatements];
            return newState;
        }

        case type.ADD_ENDING_STATEMENTS: {
            const newState = { ...state };
            newState.loadedStatements = [...newState.loadedStatements, ...action.payload];
            return newState;
        }

        case type.ADD_LOADED_PAPERS: {
            const newState = { ...state };
            newState.loadedPapers = [...action.payload];
            return newState;
        }

        default: {
            return state;
        }
    }
};
