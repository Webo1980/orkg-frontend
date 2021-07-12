import * as type from './types.js';

export const clearComparisonId = () => dispatch => {
    dispatch({ type: type.COMPARISON_CLEAR_COMPARISON_ID });
};

export const setComparisonMatrixData = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_MATRIX_DATA,
        payload: data
    });
};

export const setComparisonFilterControlData = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_FILTER_CONTROL_DATA,
        payload: data
    });
};

export const setComparisonProperties = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_PROPERTIES,
        payload: data
    });
};

export const setComparisonContributions = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_CONTRIBUTIONS,
        payload: data
    });
};

export const setComparisonData = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_DATA,
        payload: data
    });
};

export const setComparisonConfigurationAttribute = (attribute, data) => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_CONFIGURATION_ATTRIBUTE,
        payload: { attribute: attribute, value: data }
    });
};

export const setComparisonContributionList = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_CONTRIBUTIONS_LIST,
        payload: { attribute: 'contributionsList', value: data }
    });
};

export const setComparisonPredicatesList = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_PREDICATES_LIST,
        payload: { attribute: 'predicatesList', value: data }
    });
};

export const setComparisonConfiguration = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_CONFIGURATION,
        payload: data
    });
};

export const setComparisonSetResearchField = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_RESEARCH_FIELD,
        payload: data
    });
};

export const setComparisonSetPreviousVersion = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_DOI,
        payload: data
    });
};

export const setComparisonDoi = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_DOI,
        payload: data
    });
};

export const setComparisonObject = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_COMPARISON_OBJECT,
        payload: data
    });
};

export const updateVisualizations = data => dispatch => {
    dispatch({
        type: type.COMPARISON_SET_VISUALIZATIONS,
        payload: data
    });
};
