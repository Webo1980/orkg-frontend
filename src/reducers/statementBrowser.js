import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import { ENTITIES, MISC } from 'constants/graphSettings';
import { match } from 'path-to-regexp';
import { last } from 'lodash';
import ROUTES from 'constants/routes';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const getPreferenceFromCookies = p => {
    const cookieName = `preferences.${p}`;
    return cookies.get(cookieName) ? cookies.get(cookieName) === 'true' : undefined;
};

const initialState = {
    selectedResource: '',
    selectedProperty: '',
    level: 0,
    isFetchingStatements: false,
    openExistingResourcesInDialog: false,
    propertiesAsLinks: false, // if false the link appears in black font color and opens in a new window
    resourcesAsLinks: false,
    isTemplatesModalOpen: false,
    isHelpModalOpen: false,
    helpCenterArticleId: null,
    initOnLocationChange: true,
    keyToKeepStateOnLocationChange: null,
    isPreferencesOpen: false,
    preferences: {
        showClasses: getPreferenceFromCookies('showClasses') ?? false,
        showStatementInfo: getPreferenceFromCookies('showStatementInfo') ?? true,
        showValueInfo: getPreferenceFromCookies('showValueInfo') ?? true,
        showLiteralDataTypes: getPreferenceFromCookies('showLiteralDataTypes') ?? true
    },
    resources: {
        byId: {},
        allIds: []
    },
    properties: {
        byId: {},
        allIds: []
    },
    values: {
        byId: {},
        allIds: []
    },
    resourceHistory: {
        byId: {},
        allIds: []
    },
    templates: {},
    classes: {},
    // adding contribution object plus selected contributionId;
    contributions: {},
    selectedContributionId: ''
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.SET_IS_HELP_MODAL_OPEN: {
            const { payload } = action;
            const newState = dotProp.set(state, `isHelpModalOpen`, payload.isOpen);
            return dotProp.set(newState, `helpCenterArticleId`, payload.articleId);
        }

        case type.SET_IS_TEMPLATES_MODAL_OPEN: {
            const { payload } = action;
            return dotProp.set(state, `isTemplatesModalOpen`, payload.isOpen);
        }

        case type.SET_IS_PREFERENCES_OPEN: {
            const { payload } = action;
            return dotProp.set(state, `isPreferencesOpen`, payload);
        }

        case type.UPDATE_PREFERENCES: {
            const { payload } = action;

            return {
                ...state,
                preferences: {
                    showClasses: typeof payload.showClasses === 'boolean' ? payload.showClasses : state.preferences.showClasses,
                    showStatementInfo:
                        typeof payload.showStatementInfo === 'boolean' ? payload.showStatementInfo : state.preferences.showStatementInfo,
                    showValueInfo: typeof payload.showValueInfo === 'boolean' ? payload.showValueInfo : state.preferences.showValueInfo,
                    showLiteralDataTypes:
                        typeof payload.showLiteralDataTypes === 'boolean' ? payload.showLiteralDataTypes : state.preferences.showLiteralDataTypes
                }
            };
        }

        case type.CREATE_RESOURCE: {
            const { payload } = action;

            let newState = dotProp.set(state, 'resources.byId', ids => ({
                ...ids,
                [payload.resourceId]: {
                    label: payload.label ? payload.label : '',
                    existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                    shared: payload.shared ? payload.shared : 1,
                    propertyIds: [],
                    classes: payload.classes ? payload.classes : [],
                    _class: payload._class ? payload._class : ENTITIES.RESOURCE
                }
            }));

            newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

            return newState;
        }

        case type.CREATE_TEMPLATE: {
            const { payload } = action;
            let newState = dotProp.set(state, `templates.${payload.id}`, payload);
            if (dotProp.get(state, `classes.${payload.class.id}`) && dotProp.get(state, `classes.${payload.class.id}.templateIds`)) {
                newState = dotProp.set(newState, `classes.${payload.class.id}.templateIds`, ids => [...ids, payload.id]);
            } else {
                newState = dotProp.set(newState, `classes.${payload.class.id}`, { ...payload.class, templateIds: [payload.id] });
            }
            return newState;
        }

        case type.IS_FETCHING_TEMPLATES_OF_CLASS: {
            const { classID } = action;

            let newState = dotProp.set(state, `classes.${classID}.isFetching`, true);
            newState = dotProp.set(newState, `classes.${classID}.templateIds`, []); // in case there is no template for this class
            return {
                ...newState
            };
        }

        case type.DONE_FETCHING_TEMPLATES_OF_CLASS: {
            const { classID } = action;

            const newState = dotProp.set(state, `classes.${classID}.isFetching`, false);

            return {
                ...newState
            };
        }

        case type.IS_FETCHING_TEMPLATE_DATA: {
            const { templateID } = action;

            const newState = dotProp.set(state, `templates.${templateID}.isFetching`, true);

            return {
                ...newState
            };
        }

        case type.DONE_FETCHING_TEMPLATE_DATA: {
            const { templateID } = action;

            const newState = dotProp.set(state, `templates.${templateID}.isFetching`, false);

            return {
                ...newState
            };
        }

        case type.CREATE_PROPERTY: {
            const { payload } = action;
            let newState;
            if (dotProp.get(state, `resources.byId.${payload.resourceId}`)) {
                newState = dotProp.set(
                    dotProp.get(state, `resources.byId.${payload.resourceId}.propertyIds`)
                        ? state
                        : dotProp.set(state, `resources.byId.${payload.resourceId}.propertyIds`, []),
                    `resources.byId.${payload.resourceId}.propertyIds`,
                    propertyIds => [...propertyIds, payload.propertyId]
                );

                newState = dotProp.set(newState, 'properties.byId', ids => ({
                    ...ids,
                    [payload.propertyId]: {
                        ...payload,
                        existingPredicateId: payload.existingPredicateId ? payload.existingPredicateId : null,
                        valueIds: [],
                        isExistingProperty: payload.isExistingProperty ? payload.isExistingProperty : false,
                        isEditing: false,
                        isSaving: false,
                        isAnimated: payload.isAnimated !== undefined ? payload.isAnimated : false
                    }
                }));
                newState = dotProp.set(newState, 'properties.allIds', ids => [...ids, payload.propertyId]);
            }
            if (payload.createAndSelect) {
                newState = dotProp.set(newState, 'selectedProperty', payload.propertyId);
            }
            return newState ? newState : state;
        }

        case type.DELETE_PROPERTY: {
            const { payload } = action;

            let newState = dotProp.delete(state, `properties.byId.${payload.id}`);

            const propertyIndex = dotProp.get(newState, 'properties.allIds').indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.allIds.${propertyIndex}`);

            const resourceIndex = dotProp.get(newState, `resources.byId.${payload.resourceId}.propertyIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `resources.byId.${payload.resourceId}.propertyIds.${resourceIndex}`);

            // TODO: maybe also delete related values, so it becomes easier to make the API call later?

            return newState;
        }

        case type.UPDATE_PROPERTY_LABEL: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.propertyId}.label`, payload.label);
            return newState;
        }

        case type.CHANGE_PROPERTY: {
            const { payload } = action;
            let newState = dotProp.set(state, `properties.byId.${payload.propertyId}.label`, payload.newProperty.label);
            newState = dotProp.set(
                newState,
                `properties.byId.${payload.propertyId}.existingPredicateId`,
                payload.newProperty.isExistingProperty ? payload.newProperty.id : false
            );
            newState = dotProp.set(newState, `properties.byId.${payload.propertyId}.isExistingProperty`, payload.newProperty.isExistingProperty);
            return newState;
        }

        case type.TOGGLE_EDIT_PROPERTY_LABEL: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isEditing`, v => !v);
            return newState;
        }

        case type.IS_SAVING_PROPERTY: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isSaving`, v => true);
            return newState;
        }

        case type.IS_DELETING_PROPERTY: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isDeleting`, v => true);
            return newState;
        }

        case type.DONE_ANIMATION: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isAnimated`, v => true);
            return newState;
        }

        case type.DONE_SAVING_PROPERTY: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isSaving`, v => false);
            return newState;
        }

        case type.DONE_DELETING_PROPERTY: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isDeleting`, v => false);
            return newState;
        }

        case type.CREATE_VALUE: {
            const { payload } = action;
            let newState;
            if (dotProp.get(state, `properties.byId.${payload.propertyId}`)) {
                newState = dotProp.set(state, `properties.byId.${payload.propertyId}.valueIds`, valueIds => [...valueIds, payload.valueId]);

                newState = dotProp.set(newState, 'values.byId', ids => ({
                    ...ids,
                    [payload.valueId]: {
                        ...payload,
                        resourceId: payload.resourceId ? payload.resourceId : null,
                        isExistingValue: payload.isExistingValue ? payload.isExistingValue : false,
                        existingStatement: payload.existingStatement ? payload.existingStatement : false,
                        statementId: payload.statementId,
                        isEditing: false,
                        isSaving: false,
                        shared: payload.shared ? payload.shared : 1
                    }
                }));

                newState = dotProp.set(newState, 'values.allIds', ids => [...ids, payload.valueId]);

                // TODO: is the same as creating a resource in the contributions, so make a function
                // add a new resource when a object value is created

                //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
                if (payload.__class !== ENTITIES.LITERAL && !state.resources.byId[payload.resourceId]) {
                    newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

                    newState = dotProp.set(newState, 'resources.byId', ids => ({
                        ...ids,
                        [payload.resourceId]: {
                            ...payload,
                            existingResourceId: payload.existingResourceId && payload.isExistingValue ? payload.existingResourceId : null,
                            propertyIds: []
                        }
                    }));
                }
            }
            return newState ? newState : state;
        }

        case type.DELETE_VALUE: {
            const { payload } = action;

            let newState = dotProp.delete(state, `values.byId.${payload.id}`);

            const valueIndex = dotProp.get(newState, 'values.allIds').indexOf(payload.id);
            newState = dotProp.delete(newState, `values.allIds.${valueIndex}`);

            const propertyIndex = dotProp.get(newState, `properties.byId.${payload.propertyId}.valueIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.byId.${payload.propertyId}.valueIds.${propertyIndex}`);

            return newState;
        }

        case type.CHANGE_VALUE: {
            const { payload } = action;
            let newState;
            if (dotProp.get(state, `values.byId.${payload.valueId}`)) {
                newState = dotProp.set(state, `values.byId.${payload.valueId}`, v => ({
                    type: v.type,
                    classes: payload.classes ? payload.classes : [],
                    label: payload.label ? payload.label : '',
                    ...(v.type === 'literal' && { datatype: payload.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE }),
                    resourceId: payload.resourceId ? payload.resourceId : null,
                    isExistingValue: payload.isExistingValue ? payload.isExistingValue : false,
                    existingStatement: payload.existingStatement ? payload.existingStatement : false,
                    statementId: payload.statementId ? payload.statementId : null,
                    isEditing: v.isEditing,
                    isSaving: v.isSaving,
                    shared: payload.shared ? payload.shared : 1
                }));
                //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
                if (!state.resources.byId[payload.resourceId]) {
                    newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

                    newState = dotProp.set(newState, 'resources.byId', ids => ({
                        ...ids,
                        [payload.resourceId]: {
                            existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                            id: payload.resourceId,
                            label: payload.label,
                            shared: payload.shared ? payload.shared : 1,
                            propertyIds: [],
                            classes: payload.classes ? payload.classes : []
                        }
                    }));
                }
            }
            return newState ? newState : state;
        }

        case type.IS_SAVING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isSaving`, v => true);
            return newState;
        }

        case type.DONE_SAVING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isSaving`, v => false);
            return newState;
        }

        case type.IS_ADDING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isAddingValue`, v => true);
            return newState;
        }

        case type.DONE_ADDING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isAddingValue`, v => false);
            return newState;
        }

        case type.IS_DELETING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isDeleting`, v => true);
            return newState;
        }

        case type.DONE_DELETING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isDeleting`, v => false);
            return newState;
        }

        case type.TOGGLE_EDIT_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isEditing`, v => !v);
            return newState;
        }

        case type.UPDATE_RESOURCE_CLASSES: {
            const { payload } = action;
            const valueId = dotProp.get(state, `resources.byId.${payload.resourceId}.valueId`);
            let newState = dotProp.set(state, `resources.byId.${payload.resourceId}.classes`, payload.classes);
            if (valueId) {
                newState = dotProp.set(newState, `values.byId.${valueId}.classes`, payload.classes);
            }
            return newState;
        }

        case type.UPDATE_VALUE_LABEL: {
            const { payload } = action;
            let newState = dotProp.set(state, `values.byId.${payload.valueId}.label`, payload.label);
            if (payload.datatype) {
                newState = dotProp.set(newState, `values.byId.${payload.valueId}.datatype`, payload.datatype);
            }
            // Update all the labels of the same resource ID
            const resourceId = dotProp.get(state, `values.byId.${payload.valueId}.resourceId`);
            if (resourceId) {
                newState = dotProp.set(newState, `resources.byId.${resourceId}.label`, payload.label);
                for (const valueId of newState.values.allIds) {
                    if (dotProp.get(newState, `values.byId.${valueId}.resourceId`) === resourceId && valueId !== payload.valueId) {
                        newState = dotProp.set(newState, `values.byId.${valueId}.label`, payload.label);
                    }
                }
                // Update the label in resource history
                newState = dotProp.set(newState, `resourceHistory.byId.${resourceId}.label`, payload.label);
            }
            return newState;
        }

        case type.SELECT_RESOURCE: {
            const { payload } = action;
            const level = payload.increaseLevel ? state.level + 1 : state.level - 1;

            let newState = dotProp.set(state, `selectedResource`, payload.resourceId);
            newState = dotProp.set(newState, `level`, level > 0 ? level : 0);

            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                // this wants to update the contribution object
                if (payload.resourceId === state.selectedContributionId) {
                    if (dotProp.get(state, `contributions.${state.selectedContributionId}.selectedResource`) === '') {
                        // there is no selected data yet;
                        newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.selectedResource`, payload.resourceId);
                        newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.level`, level > 0 ? level : 0);
                    }
                } else {
                    // check if this resource exists in the contribution data ;
                    const isContributionResource = !!state.contributions[payload.resourceId];
                    if (!isContributionResource) {
                        newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.selectedResource`, payload.resourceId);
                        newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.level`, level > 0 ? level : 0);
                    }
                }
            }

            return newState;
        }

        case type.RESET_LEVEL: {
            return {
                ...state,
                level: 0
            };
        }

        case type.ADD_RESOURCE_HISTORY: {
            const { payload } = action;
            const resourceId = payload.resourceId ? payload.resourceId : null; //state.contributions.byId[state.selectedContribution].resourceId
            const lastResourceId = state.resourceHistory.allIds[state.resourceHistory.allIds.length - 1];

            let newState = dotProp.set(state, 'resourceHistory.byId', ids => ({
                ...ids,
                [resourceId]: {
                    id: resourceId,
                    label: payload.label,
                    propertyLabel: payload.propertyLabel
                },
                ...(lastResourceId
                    ? {
                          [lastResourceId]: {
                              ...state.resourceHistory.byId[lastResourceId],
                              selectedProperty: state.selectedProperty
                          }
                      }
                    : {})
            }));

            newState = dotProp.set(newState, 'resourceHistory.allIds', ids => [...ids, resourceId]);

            // overwrite contribution history if needed
            if (!state.initOnLocationChange && dotProp.get(newState, `contributions.${newState.selectedContributionId}`)) {
                const isContributionResource = !!newState.contributions[resourceId];

                if (!isContributionResource) {
                    newState = dotProp.set(newState, `contributions.${newState.selectedContributionId}.resourceHistory`, newState.resourceHistory);
                } else {
                    if (dotProp.get(newState, `contributions.${newState.selectedContributionId}`).resourceHistory.allIds.length === 0) {
                        // will ignore history updates if there is already some data;
                        newState = dotProp.set(
                            newState,
                            `contributions.${newState.selectedContributionId}.resourceHistory`,
                            newState.resourceHistory
                        );
                    }
                }
            }

            return { ...newState };
        }

        case type.SET_RESOURCE_HISTORY: {
            const { payload } = action;
            const lastResourceId = last(state.resourceHistory.allIds);
            let newState = dotProp.set(state, 'resourceHistory.byId', ids => ({
                ...ids,
                ...(lastResourceId
                    ? {
                          [lastResourceId]: {
                              ...state.resourceHistory.byId[lastResourceId],
                              propertyLabel: last(payload.filter(pt => pt._class === ENTITIES.PREDICATE))?.label
                          }
                      }
                    : {})
            }));
            newState = dotProp.set(newState, 'resourceHistory.allIds', ids => [
                ...payload.filter(pt => pt._class !== ENTITIES.PREDICATE).map(pt => pt.id),
                ...ids
            ]);
            payload.map((pt, index) => {
                if (pt._class !== ENTITIES.PREDICATE) {
                    newState = dotProp.set(newState, 'resourceHistory.byId', ids => ({
                        ...ids,
                        [pt.id]: {
                            id: pt.id,
                            label: pt.label,
                            propertyLabel: payload[index - 1]?.label
                        }
                    }));
                }
                return null;
            });
            return { ...newState, level: payload.length - 1 };
        }

        case type.GOTO_RESOURCE_HISTORY: {
            const { payload } = action;
            const ids = state.resourceHistory.allIds.slice(0, payload.historyIndex + 1); //TODO: it looks like historyIndex can be derived, so remove it from payload

            let newState = state;
            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.resourceHistory`, {
                    byId: {
                        ...state.resourceHistory.byId // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                    },
                    allIds: ids
                });
                newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.level`, payload.historyIndex);
                newState = dotProp.set(newState, `contributions.${state.selectedContributionId}.selectedResource`, payload.id);
                newState = dotProp.set(
                    newState,
                    `contributions.${state.selectedContributionId}.selectedProperty`,
                    state.resourceHistory.byId[payload.id].selectedProperty
                );
            }

            return {
                ...newState,
                level: payload.historyIndex,
                selectedResource: payload.id,
                selectedProperty: state.resourceHistory.byId[payload.id].selectedProperty,
                resourceHistory: {
                    allIds: ids,
                    byId: {
                        ...state.resourceHistory.byId // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                    }
                }
            };
        }

        case type.STATEMENT_BROWSER_UPDATE_SETTINGS: {
            const { payload } = action;

            return {
                ...state,
                openExistingResourcesInDialog:
                    typeof payload.openExistingResourcesInDialog === 'boolean'
                        ? payload.openExistingResourcesInDialog
                        : state.openExistingResourcesInDialog,
                propertiesAsLinks: typeof payload.propertiesAsLinks === 'boolean' ? payload.propertiesAsLinks : state.propertiesAsLinks,
                resourcesAsLinks: typeof payload.resourcesAsLinks === 'boolean' ? payload.resourcesAsLinks : state.resourcesAsLinks,
                initOnLocationChange: typeof payload.initOnLocationChange === 'boolean' ? payload.initOnLocationChange : state.initOnLocationChange,
                keyToKeepStateOnLocationChange: payload.keyToKeepStateOnLocationChange ? payload.keyToKeepStateOnLocationChange : null
            };
        }

        case type.CLEAR_RESOURCE_HISTORY: {
            return {
                ...state,
                level: 0,
                resourceHistory: {
                    byId: {},
                    allIds: []
                }
            };
        }

        case type.STATEMENT_BROWSER_LOAD_DATA: {
            const { payload } = action;
            return {
                ...payload
            };
        }

        case type.ADD_FETCHED_STATEMENT: {
            return {
                ...state
            };
        }

        case type.SET_STATEMENT_IS_FETCHED: {
            const { resourceId, depth } = action;

            let newState = dotProp.set(state, `resources.byId.${resourceId}.isFetched`, true);
            newState = dotProp.set(newState, `resources.byId.${resourceId}.fetchedDepth`, depth);
            newState = dotProp.set(newState, `resources.byId.${resourceId}.isFetching`, false);

            return {
                ...newState
            };
        }

        case type.IS_FETCHING_STATEMENTS: {
            const { resourceId } = action;
            let newState = dotProp.set(state, `isFetchingStatements`, true);
            if (resourceId) {
                newState = dotProp.set(newState, `resources.byId.${resourceId}.isFetching`, true);
                newState = dotProp.set(newState, `resources.byId.${resourceId}.isFetched`, false);
            }

            return {
                ...newState
            };
        }

        case type.FAILED_FETCHING_STATEMENTS: {
            const { resourceId } = action;
            let newState = dotProp.set(state, `isFetchingStatements`, false);
            if (resourceId) {
                newState = dotProp.set(newState, `resources.byId.${resourceId}.isFetching`, false);
                newState = dotProp.set(newState, `resources.byId.${resourceId}.isFailedFetching`, true);
            }

            return {
                ...newState
            };
        }

        case type.STATEMENT_BROWSER_UPDATE_CONTRIBUTION_LABEL: {
            const newLabel = action.payload.label;
            const contribId = action.payload.id;

            let newState = dotProp.set(state, `resources.byId.${contribId}.label`, newLabel);
            newState = dotProp.set(newState, `resourceHistory.byId.${contribId}.label`, newLabel);
            return {
                ...newState
            };
        }

        case type.DONE_FETCHING_STATEMENTS: {
            return {
                ...state,
                isFetchingStatements: false
            };
        }

        case type.RESET_STATEMENT_BROWSER: {
            const newState = dotProp.set(initialState, `preferences`, {
                showClasses: getPreferenceFromCookies('showClasses') ?? false,
                showStatementInfo: getPreferenceFromCookies('showStatementInfo') ?? true,
                showValueInfo: getPreferenceFromCookies('showValueInfo') ?? true,
                showLiteralDataTypes: getPreferenceFromCookies('showLiteralDataTypes') ?? false
            });
            return newState;
        }

        case '@@router/LOCATION_CHANGE': {
            //from connected-react-router, reset the wizard when the page is changed
            const matchViewPaper = match(ROUTES.VIEW_PAPER);
            const contributionChange = matchViewPaper(action.payload.location.pathname);

            let newState;
            if (!state.initOnLocationChange && state.keyToKeepStateOnLocationChange === contributionChange?.params?.resourceId) {
                newState = {
                    ...state,
                    // returns current state but resets some variables :
                    selectedResource: '',
                    selectedProperty: '',
                    level: 0,
                    isFetchingStatements: false,
                    resourceHistory: {
                        byId: {},
                        allIds: []
                    }
                };
            } else {
                newState = initialState;
                newState = dotProp.set(newState, `preferences`, {
                    showClasses: getPreferenceFromCookies('showClasses') ?? false,
                    showStatementInfo: getPreferenceFromCookies('showStatementInfo') ?? true,
                    showValueInfo: getPreferenceFromCookies('showValueInfo') ?? true,
                    showLiteralDataTypes: getPreferenceFromCookies('showLiteralDataTypes') ?? false
                });
            }
            return { ...newState };
        }

        /** -- Handling for creation of contribution objects**/
        case type.STATEMENT_BROWSER_CREATE_CONTRIBUTION_OBJECT: {
            //state.selectedContributionId = action.payload.id;
            let newState = { ...state, selectedContributionId: action.payload.id };
            if (!state.contributions.hasOwnProperty(action.payload.id)) {
                const initData = {
                    selectedResource: '',
                    selectedProperty: '',
                    isFetchingStatements: false,
                    level: 0,
                    resourceHistory: {
                        byId: {},
                        allIds: []
                    }
                };
                newState = dotProp.set(newState, `contributions.${action.payload.id}`, initData);
                return newState;
            }
            return newState;
        }

        case type.STATEMENT_BROWSER_LOAD_CONTRIBUTION_HISTORY: {
            const contribObj = state.contributions[action.payload.id];
            let newState = state;
            if (contribObj) {
                newState = dotProp.set(newState, `selectedResource`, contribObj.selectedResource);
                newState = dotProp.set(newState, `selectedProperty`, contribObj.selectedProperty);
                newState = dotProp.set(newState, `isFetchingStatements`, contribObj.isFetchingStatements);
                newState = dotProp.set(newState, `level`, contribObj.level);
                newState = dotProp.set(newState, `resourceHistory`, contribObj.resourceHistory);
            }

            return newState;
        }

        default: {
            return state;
        }
    }
};
