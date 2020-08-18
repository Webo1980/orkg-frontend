import * as type from 'actions/types';
import {
    createProperty,
    shouldFetchStatementsForResource,
    currentState,
    fetchTemplatesofClassIfNeeded,
    updateResourceClasses,
    createRequiredPropertiesInResource,
    createValue,
    createResource,
    selectResource
} from 'actions/statementBrowser';
import { resetStatementBrowser, loadCachedVersion } from 'actions/statementBrowser';
import * as network from 'network';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import { orderBy } from 'lodash';
import { guid } from 'utils';

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

export const blockGraphUpdatesWhileLoading = val => dispatch => {
    dispatch({
        type: type.SB_BLOCK_UPDATES,
        payload: {
            blocked: val
        }
    });
};

export const loadResourceDataForContribution = data => dispatch => {
    const { contributionOriginId, resourceId } = data;
    console.log('we want to load data for contribution id ', contributionOriginId);
    console.log('In the resource  ', resourceId);

    const temp = {};
    dispatch(currentState(temp));

    const contributonsStore = temp.contributionStore;

    if (contributonsStore.hasOwnProperty(contributionOriginId)) {
        // cool lets go
        dispatch(blockGraphUpdatesWhileLoading(true));
        const storeToLoad = contributonsStore[contributionOriginId];
        console.log(storeToLoad);

        dispatch(loadCachedVersion(storeToLoad));
        const oldSelectedResource = storeToLoad.selectedResource;

        getDataPromisedForResource(resourceId, dispatch).then(() => {
            console.log('cool we have done it ');

            const newState = {};
            dispatch(currentState(temp));
            console.log(newState);

            // TODO : dispatch event that overwrites the selected resource value
            //dispatch(selectResource())//<< this is where we need to attack
            // dispatch(loadCachedVersion(temp.statementBrowser));
            dispatch(blockGraphUpdatesWhileLoading(false));
        });

        // now we should be able to access other functions like selecting a resource
    }
};

export const loadContributionData = contributionId => dispatch => {
    // read the statementBrowser for this contribution Id;
    // can we request a new statemenentBrowser from exsisint ones;
    console.log('Wants to load that ', contributionId);
    const temp = {};
    dispatch(blockGraphUpdatesWhileLoading(true));
    dispatch(currentState(temp));
    dispatch(resetStatementBrowser());
    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: contributionId,
            resourceId: contributionId
        }
    });

    dispatch(
        createResource({
            //only needed for connecting properties, label is not shown
            resourceId: contributionId,
            label: '',
            existingResourceId: contributionId
        })
    );

    getDataPromised(contributionId, dispatch).then(() => {
        const newState = {};

        // in the current statement browser, we select the contributionId as initial value;
        dispatch(selectResource({ increaseLevel: false, resourceId: contributionId, label: 'Main' })).then(() => {
            // we save it in the object newState
            dispatch(currentState(newState));
            // then we push this into out statementBrowser store
            dispatch(updateStatementStore({ store: newState.statementBrowser, contributionId: contributionId }));
            // and reload the cached version for the viewPaperPage so it shows the old state
            /* note : this is for the non hybrid view, in hybrid view we will update the selection based on the click event */
            dispatch(loadCachedVersion(temp.statementBrowser));
            dispatch(blockGraphUpdatesWhileLoading(false));
        });
    });
};

const getDataPromisedForResource = async (id, dispatch) => {
    return promisedFetchStatementsForResource(
        {
            resourceId: id,
            existingResourceId: id,
            isContribution: false,
            depth: 3 // load depth 3 the first time
        },
        dispatch
    );
};

const getDataPromised = async (id, dispatch) => {
    return promisedFetchStatementsForResource(
        {
            resourceId: id,
            existingResourceId: id,
            isContribution: true,
            depth: 3 // load depth 3 the first time
        },
        dispatch
    );
};

export const promisedFetchStatementsForResource = async (data, dispatch) => {
    // we make this serialized not recursive;

    const queryPromise = new Promise(function(resolve) {
        let { isContribution, depth, rootNodeType } = data;
        const { resourceId, existingResourceId } = data;
        isContribution = isContribution ? isContribution : false;

        if (typeof depth == 'number') {
            depth = depth - 1;
        } else {
            depth = 0;
        }

        rootNodeType = rootNodeType ?? 'resource';
        const resourceStatements = [];

        const objRef = { idsToFetchOnDepth: {} };
        dispatch(serializedCall(resourceStatements, existingResourceId, resourceId, isContribution, 2, rootNodeType, objRef)).then(() => {
            // going in level 1 ;
            if (objRef.idsToFetchOnDepth[1]) {
                const promises = objRef.idsToFetchOnDepth[1].map(resource =>
                    dispatch(serializedCall(resourceStatements, resource, resource, isContribution, 1, rootNodeType, objRef))
                );

                Promise.all(promises).then(() => {
                    // going in level 0 ;
                    if (objRef.idsToFetchOnDepth[0]) {
                        const promises = objRef.idsToFetchOnDepth[0].map(resource =>
                            dispatch(serializedCall(resourceStatements, resource, resource, isContribution, 0, rootNodeType, objRef))
                        );
                        Promise.all(promises).then(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });

    await queryPromise;
};

export const serializedCall = (resourceStatements, existingResourceId, resourceId, isContribution, depth, rootNodeType, objRef) => {
    // Get the resource classes
    return (dispatch, getState) => {
        if (shouldFetchStatementsForResource(getState(), existingResourceId, depth)) {
            dispatch({
                type: type.IS_FETCHING_STATEMENTS,
                resourceId: resourceId
            });
            let subject;
            if (rootNodeType === 'predicate') {
                subject = network.getPredicate(existingResourceId);
            } else {
                subject = network.getResource(existingResourceId);
            }

            return subject.then(response => {
                let promises;
                // fetch the statements
                const resourceStatementsPromise = network.getStatementsBySubject({ id: existingResourceId }).then(response => {
                    resourceStatements = response;
                    return Promise.resolve();
                });
                if (rootNodeType === 'predicate') {
                    // get templates of classes
                    const predicateClass = dispatch(fetchTemplatesofClassIfNeeded(CLASSES.PREDICATE));
                    promises = Promise.all([predicateClass, resourceStatementsPromise]);
                } else {
                    let resourceClasses = response.classes ?? [];
                    // get templates of classes
                    if (resourceClasses && resourceClasses.length > 0) {
                        resourceClasses = resourceClasses.map(classID => dispatch(fetchTemplatesofClassIfNeeded(classID)));
                    }
                    // set the resource classes (initialize doesn't set the classes)
                    const resourceUpdateClasses = dispatch(updateResourceClasses({ resourceId, classes: response.classes }));
                    promises = Promise.all([resourceUpdateClasses, resourceStatementsPromise, ...resourceClasses]);
                }

                return promises
                    .then(() => dispatch(createRequiredPropertiesInResource(resourceId)))
                    .then(existingProperties => {
                        // all the template of classes are loaded
                        // add the required proerty first
                        const researchProblems = [];

                        // Sort predicates and values by label
                        resourceStatements = orderBy(
                            resourceStatements,
                            [
                                resourceStatements => resourceStatements.predicate.label.toLowerCase(),
                                resourceStatements => resourceStatements.object.label.toLowerCase()
                            ],
                            ['asc']
                        );
                        // Finished the call
                        dispatch({
                            type: type.DONE_FETCHING_STATEMENTS
                        });

                        for (const statement of resourceStatements) {
                            let propertyId = guid();
                            const valueId = guid();
                            // filter out research problem to show differently
                            if (isContribution && statement.predicate.id === PREDICATES.HAS_RESEARCH_PROBLEM) {
                                researchProblems.push({
                                    label: statement.object.label,
                                    id: statement.object.id,
                                    statementId: statement.id
                                });
                            } else {
                                // check whether there already exist a property for this, then combine
                                if (existingProperties.filter(e => e.existingPredicateId === statement.predicate.id).length === 0) {
                                    dispatch(
                                        createProperty({
                                            propertyId: propertyId,
                                            resourceId: resourceId,
                                            existingPredicateId: statement.predicate.id,
                                            label: statement.predicate.label,
                                            isExistingProperty: true,
                                            isTemplate: false
                                        })
                                    );

                                    existingProperties.push({
                                        existingPredicateId: statement.predicate.id,
                                        propertyId
                                    });
                                } else {
                                    propertyId = existingProperties.filter(e => e.existingPredicateId === statement.predicate.id)[0].propertyId;
                                }

                                dispatch(
                                    createValue({
                                        valueId: valueId,
                                        existingResourceId: statement.object.id,
                                        propertyId: propertyId,
                                        label: statement.object.label,
                                        type: statement.object._class === 'resource' ? 'object' : statement.object._class, // TODO: change 'object' to 'resource' (wrong term used here, since it is always an object)
                                        classes: statement.object.classes ? statement.object.classes : [],
                                        ...(statement.object._class === 'literal' && {
                                            datatype: statement.object.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE
                                        }),
                                        isExistingValue: true,
                                        existingStatement: true,
                                        statementId: statement.id,
                                        shared: statement.object.shared
                                    })
                                ).then(() => {
                                    if (depth >= 1 && statement.object._class === 'resource') {
                                        if (!objRef.idsToFetchOnDepth[depth - 1]) {
                                            objRef.idsToFetchOnDepth[depth - 1] = [];
                                        }
                                        objRef.idsToFetchOnDepth[depth - 1].push(statement.object.id);
                                    }
                                });

                                //Load template of objects
                                statement.object.classes && statement.object.classes.map(classID => dispatch(fetchTemplatesofClassIfNeeded(classID)));
                            }
                        }

                        if (isContribution) {
                            dispatch({
                                type: type.SET_RESEARCH_PROBLEMS,
                                payload: {
                                    researchProblems,
                                    resourceId
                                }
                            });
                        }
                        dispatch({
                            type: type.SET_STATEMENT_IS_FECHTED,
                            resourceId: resourceId,
                            depth: depth
                        });
                    });
            });
        } else {
            return Promise.resolve();
        }
    };
};
