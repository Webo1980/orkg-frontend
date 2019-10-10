import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    selectedResource: '',
    level: 0,
    isFetchingStatements: false,
    resources: {
        byId: {},
        allIds: [],
    },
    properties: {
        byId: {},
        allIds: [],
    },
    values: {
        byId: {},
        allIds: [],
    },
    resourceHistory: {
        byId: {},
        allIds: [],
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case type.CREATE_RESOURCE: {
            let { payload } = action;

            let newState = dotProp.set(state, 'resources.byId', ids => ({
                ...ids,
                [payload.resourceId]: {
                    label: payload.label ? payload.label : '',
                    existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                    propertyIds: [],
                }
            }));

            newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

            return newState;
        }

        case type.CREATE_PROPERTY: {
            let { payload } = action;
            let newState = dotProp.set(state, `resources.byId.${payload.resourceId}.propertyIds`, propertyIds => [...propertyIds, payload.propertyId]);

            newState = dotProp.set(newState, 'properties.byId', ids => ({
                ...ids,
                [payload.propertyId]: {
                    label: payload.label ? payload.label : '',
                    existingPredicateId: payload.existingPredicateId ? payload.existingPredicateId : null,
                    valueIds: [],
                    isExistingProperty: payload.isExistingProperty ? payload.isExistingProperty : false,
                }
            }));

            newState = dotProp.set(newState, 'properties.allIds', ids => [...ids, payload.propertyId]);

            return newState;
        }

        case type.DELETE_PROPERTY: {
            let { payload } = action;

            let newState = dotProp.delete(state, `properties.byId.${payload.id}`);

            let propertyIndex = dotProp.get(newState, 'properties.allIds').indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.allIds.${propertyIndex}`);

            let resourceIndex = dotProp.get(newState, `resources.byId.${payload.resourceId}.propertyIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `resources.byId.${payload.resourceId}.propertyIds.${resourceIndex}`);

            // TODO: maybe also delete related values, so it becomes easier to make the API call later?

            return newState;
        }

        case type.CREATE_VALUE: {
            let { payload } = action;

            let newState = dotProp.set(state, `properties.byId.${payload.propertyId}.valueIds`, valueIds => [...valueIds, payload.valueId]);

            newState = dotProp.set(newState, 'values.byId', ids => ({
                ...ids,
                [payload.valueId]: {
                    type: payload.type,
                    classes: payload.classes ? payload.classes : [],
                    label: payload.label ? payload.label : '',
                    resourceId: payload.resourceId ? payload.resourceId : null,
                    isExistingValue: payload.isExistingValue ? payload.isExistingValue : false,
                    existingStatement: payload.existingStatement ? payload.existingStatement : false,
                }
            }));

            newState = dotProp.set(newState, 'values.allIds', ids => [...ids, payload.valueId]);

            // TODO: is the same as creating a resource in the contributions, so make a function 
            // add a new resource when a object value is created

            //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
            if (payload.type === 'object' && !state.resources.byId[payload.resourceId]) {
                newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

                newState = dotProp.set(newState, 'resources.byId', ids => ({
                    ...ids,
                    [payload.resourceId]: {
                        existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                        id: payload.resourceId,
                        label: payload.label,
                        propertyIds: [],
                    }
                }));
            }

            return newState;
        }

        case type.DELETE_VALUE: {
            let { payload } = action;

            let newState = dotProp.delete(state, `values.byId.${payload.id}`);

            let valueIndex = dotProp.get(newState, 'values.allIds').indexOf(payload.id);
            newState = dotProp.delete(newState, `values.allIds.${valueIndex}`);

            let propertyIndex = dotProp.get(newState, `properties.byId.${payload.propertyId}.valueIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.byId.${payload.propertyId}.valueIds.${propertyIndex}`);

            return newState;
        }

        case type.SELECT_RESOURCE: {
            let { payload } = action;
            let level = payload.increaseLevel ? state.level + 1 : state.level - 1;

            return {
                ...state,
                selectedResource: payload.resourceId,
                level: level > 0 ? level : 0,
            };
        }

        case type.RESET_LEVEL: {
            return {
                ...state,
                level: 0,
            };
        }

        case type.ADD_RESOURCE_HISTORY: {
            let { payload } = action;
            let resourceId = payload.resourceId ? payload.resourceId : null; //state.contributions.byId[state.selectedContribution].resourceId

            let newState = dotProp.set(state, 'resourceHistory.byId', ids => ({
                ...ids,
                [resourceId]: {
                    id: resourceId,
                    label: payload.label,
                }
            }));

            newState = dotProp.set(newState, 'resourceHistory.allIds', ids => [...ids, resourceId]);

            return newState;
        }

        case type.GOTO_RESOURCE_HISTORY: {
            let { payload } = action;
            let ids = state.resourceHistory.allIds.slice(0, payload.historyIndex + 1); //TODO: it looks like historyIndex can be derived, so remove it from payload

            return {
                ...state,
                level: payload.historyIndex,
                selectedResource: payload.id,
                resourceHistory: {
                    allIds: ids,
                    byId: {
                        ...state.resourceHistory.byId // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                    }
                }
            };
        }

        case type.CLEAR_RESOURCE_HISTORY: {
            return {
                ...state,
                resourceHistory: {
                    byId: {},
                    allIds: [],
                }
            };
        }

        case type.ADD_FETCHED_STATEMENT: {
            return {
                ...state,
            }
        }

        case type.SET_STATEMENT_IS_FECHTED: {
            let { resourceId } = action;

            let newState = dotProp.set(state, `resources.byId.${resourceId}.isFechted`, true);

            return {
                ...newState,
            }
        }

        case type.IS_FETCHING_STATEMENTS: {

            return {
                ...state,
                isFetchingStatements: true,
            }
        }

        case type.DONE_FETCHING_STATEMENTS: {

            return {
                ...state,
                isFetchingStatements: false,
            }
        }

        case type.RESET_STATEMENT_BROWSER: {
            return {
                ...initialState
            }
        }

        case '@@router/LOCATION_CHANGE': { //from connected-react-router, reset the wizard when the page is changed
            return {
                ...initialState
            }
        }

        default: {
            return state
        }
    }
}