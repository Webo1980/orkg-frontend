import * as network from '../network';
import * as type from './types.js';
import { guid } from '../utils';
import { mergeWith, isArray, uniqBy } from 'lodash';
import { createResource, selectResource, createProperty, createValue, loadStatementBrowserData } from './statementBrowser';
import { toast } from 'react-toastify';

export const updateGeneralData = data => dispatch => {
    dispatch({
        type: type.UPDATE_GENERAL_DATA,
        payload: data
    });
};

export const nextStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_NEXT_STEP
    });
};

export const previousStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_PREVIOUS_STEP
    });
};

export const blockNavigation = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_BLOCK_NAVIGATION
    });
};

export const loadPaperData = data => dispatch => {
    dispatch({
        type: type.ADD_PAPER_LOAD_DATA,
        payload: data.addPaper
    });

    dispatch(loadStatementBrowserData(data.statementBrowser));
};

export const updateResearchField = data => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_FIELD,
        payload: data
    });
};

export const closeTour = () => dispatch => {
    dispatch({
        type: type.CLOSE_TOUR
    });
};

export const openTour = step => dispatch => {
    dispatch({
        type: type.OPEN_TOUR,
        payload: {
            step: step ? step : 0
        }
    });
};

export const updateAbstract = data => dispatch => {
    dispatch({
        type: type.UPDATE_ABSTRACT,
        payload: data
    });
};

export const createAnnotation = data => dispatch => {
    dispatch({
        type: type.CREATE_ANNOTATION,
        payload: {
            id: guid(),
            ...data
        }
    });
};

export const setAnnotations = data => dispatch => {
    dispatch({
        type: type.SET_ANNOTATIONS,
        payload: data
    });
};

export const toggleEditAnnotation = data => dispatch => {
    dispatch({
        type: type.TOGGLE_EDIT_ANNOTATION,
        payload: data
    });
};

export const removeAnnotation = data => dispatch => {
    dispatch({
        type: type.REMOVE_ANNOTATION,
        payload: data
    });
};

export const validateAnnotation = data => dispatch => {
    dispatch({
        type: type.VALIDATE_ANNOTATION,
        payload: data
    });
};

export const updateAnnotationClass = data => dispatch => {
    dispatch({
        type: type.UPDATE_ANNOTATION_CLASS,
        payload: data
    });
};

export const clearAnnotations = () => dispatch => {
    dispatch({
        type: type.CLEAR_ANNOTATIONS
    });
};

export const createContribution = ({ selectAfterCreation = false, prefillStatements: performPrefill = false, statements = null }) => dispatch => {
    const newResourceId = guid();
    const newContributionId = guid();

    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: newContributionId,
            resourceId: newResourceId
        }
    });

    dispatch(
        createResource({
            resourceId: newResourceId
        })
    );

    if (selectAfterCreation) {
        dispatch(
            selectResource({
                increaseLevel: false,
                resourceId: newResourceId,
                label: 'Main'
            })
        );

        /*dispatch({
            type: type.ADD_RESOURCE_HISTORY,
            payload: {
                resourceId: newResourceId,
                label: 'Main',
            }
        });*/
    }

    if (performPrefill && statements) {
        dispatch(
            prefillStatements({
                statements,
                resourceId: newResourceId
            })
        );
    }
};

export const prefillStatements = ({ statements, resourceId }) => dispatch => {
    // properties
    for (const property of statements.properties) {
        dispatch(
            createProperty({
                propertyId: property.propertyId ? property.propertyId : guid(),
                existingPredicateId: property.existingPredicateId,
                resourceId: resourceId,
                label: property.label,
                isTemplate: property.isTemplate ? property.isTemplate : false,
                templateId: property.templateId ? property.templateId : null,
                templateClass: property.templateClass ? property.templateClass : null,
                isAnimated: property.isAnimated !== undefined ? property.isAnimated : false
            })
        );
    }

    // values
    for (const value of statements.values) {
        dispatch(
            createValue({
                valueId: value.valueId,
                label: value.label,
                type: value.type ? value.type : 'object',
                templateId: value.templateId ? value.templateId : null,
                propertyId: value.propertyId,
                existingResourceId: value.existingResourceId ? value.existingResourceId : null,
                classes: value.classes ? value.classes : []
            })
        );
    }
};

export const toggleAbstractDialog = data => dispatch => {
    dispatch({
        type: type.TOGGLE_ABSTRACT_DIALOG
    });
};

export const setAbstractDialogView = data => dispatch => {
    dispatch({
        type: type.SET_ABSTRACT_DIALOG_VIEW,
        payload: {
            value: data
        }
    });
};

export const deleteContribution = data => dispatch => {
    dispatch({
        type: type.DELETE_CONTRIBUTION,
        payload: {
            id: data.id
        }
    });

    dispatch(selectContribution(data.selectAfterDeletion));
};

export const selectContribution = data => dispatch => {
    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id: data.id
        }
    });

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch(
        selectResource({
            increaseLevel: false,
            resourceId: data.resourceId,
            label: 'Main',
            resetLevel: true
        })
    );
};

export const updateContributionLabel = data => dispatch => {
    dispatch({
        type: type.UPDATE_CONTRIBUTION_LABEL,
        payload: data
    });
};

export const updateResearchProblems = data => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
    });
};

export const toggleSelectedDndValues = data => dispatch => {
    dispatch({
        type: type.TOGGLE_SELECTED_DND_VALUES,
        payload: data
    });
};

export const pushToSelectedDndValues = data => dispatch => {
    dispatch({
        type: type.PUSH_TO_SELECTED_DND_VALUES,
        payload: data
    });
};

export const setLoadingAbstract = data => dispatch => {
    dispatch({
        type: type.SET_LOADING_ABSTRACT,
        payload: data
    });
};

export const setFailedLoadingAbstract = data => dispatch => {
    dispatch({
        type: type.SET_FAILED_LOADING_ABSTRACT,
        payload: data
    });
};

export const setLoadingAnnotation = data => dispatch => {
    dispatch({
        type: type.SET_LOADING_ANNOTATION,
        payload: data
    });
};

export const setFailedLoadingAnnotation = data => dispatch => {
    dispatch({
        type: type.SET_FAILED_LOADING_ANNOTATION,
        payload: data
    });
};

export const getAnnotation = data => dispatch => {
    const { abstract, classOptions } = data;
    dispatch(setLoadingAnnotation(true));
    dispatch(setFailedLoadingAnnotation(false));
    return network
        .getAnnotations(abstract)
        .then(data => {
            const annotated = [];
            const ranges = {};
            if (data && data.entities) {
                data.entities
                    .map(entity => {
                        const text = data.text.substring(entity[2][0][0], entity[2][0][1]);
                        if (annotated.indexOf(text.toLowerCase()) < 0) {
                            annotated.push(text.toLowerCase());
                            // Predicate label entity[1]
                            let rangeClass = classOptions.filter(c => c.label.toLowerCase() === entity[1].toLowerCase());
                            if (rangeClass.length > 0) {
                                rangeClass = rangeClass[0];
                            } else {
                                rangeClass = { id: entity[1], label: entity[1] };
                            }
                            const id = guid();
                            ranges[id] = {
                                id,
                                text: text,
                                start: entity[2][0][0],
                                end: entity[2][0][1] - 1,
                                certainty: entity[3],
                                class: rangeClass,
                                isEditing: false,
                                resourceId: entity[4]
                            };
                            return ranges[id];
                        } else {
                            return null;
                        }
                    })
                    .filter(r => r);
            }
            //Clear annotations
            dispatch(clearAnnotations());
            dispatch(setAnnotations(ranges));
            dispatch(setLoadingAbstract(false));
            dispatch(setFailedLoadingAbstract(false));
            dispatch(setLoadingAnnotation(false));
            dispatch(setFailedLoadingAnnotation(false));
        })
        .catch(e => {
            dispatch(setLoadingAnnotation(false));
            dispatch(setFailedLoadingAnnotation(true));
        });
};

export const fetchAbstract = data => dispatch => {
    const { DOI, classOptions } = data;
    setLoadingAbstract(true);
    setFailedLoadingAbstract(false);
    return network
        .submitGetRequest(network.semanticScholarUrl + DOI)
        .then((data, reject) => {
            if (!data.abstract) {
                return reject;
            }
            return data.abstract;
        })
        .then(abstract => {
            // remove line breaks from the abstract
            abstract = abstract.replace(/(\r\n|\n|\r)/gm, ' ');
            dispatch(setLoadingAbstract(false));
            dispatch(updateAbstract(abstract));
            dispatch(getAnnotation({ abstract, classOptions }));
        })
        .catch(() => {
            dispatch(setAbstractDialogView('input'));
            dispatch(setLoadingAbstract(false));
            dispatch(setFailedLoadingAbstract(true));
        });
};

// The function to customize merging objects (to handle using the same existing predicate twice in the same ressource)
function customizer(objValue, srcValue) {
    if (isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

export const getResourceObject = (data, resourceId, newProperties) => {
    // Make a list of new resources ids
    const newResources = data.values.allIds
        .filter(valueId => !data.values.byId[valueId].isExistingValue)
        .map(valueId => data.values.byId[valueId].resourceId);
    return mergeWith(
        {},
        ...data.resources.byId[resourceId].propertyIds.map(propertyId => {
            const property = data.properties.byId[propertyId];
            return {
                // Map properties of resource
                /* Use the temp id from unique list of new properties */
                [property.existingPredicateId
                    ? property.existingPredicateId
                    : newProperties.find(p => p[property.label])[property.label]]: property.valueIds.map(valueId => {
                    const value = data.values.byId[valueId];
                    if (value.type === 'literal' && !value.isExistingValue) {
                        return {
                            text: value.label
                        };
                    } else {
                        if (!value.isExistingValue) {
                            const newResources = {};
                            newResources[value.resourceId] = value.resourceId;
                            return {
                                '@temp': `_${value.resourceId}`,
                                label: value.label,
                                class: value.classes && value.classes.length > 0 ? value.classes[0].id : null,
                                values: Object.assign({}, getResourceObject(data, value.resourceId, newProperties))
                            };
                        } else {
                            return {
                                '@id': newResources.includes(value.resourceId) ? `_${value.resourceId}` : value.resourceId
                            };
                        }
                    }
                })
            };
        }),
        customizer
    );
};

// Middleware function to transform frontend data to backend format
export const saveAddPaper = data => {
    return async dispatch => {
        const researchProblemPredicate = process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM;
        // Get new properties (ensure that  no duplicate labels are in the new properties)
        let newProperties = data.properties.allIds.filter(propertyId => !data.properties.byId[propertyId].existingPredicateId);
        newProperties = newProperties.map(propertyId => ({ id: propertyId, label: data.properties.byId[propertyId].label }));
        newProperties = uniqBy(newProperties, 'label');
        newProperties = newProperties.map(property => ({ [property.label]: `_${property.id}` }));
        // list of new reaserch problems
        const newResearchProblem = [];
        const paperObj = {
            // Set new predicates label and temp ID
            predicates: newProperties,
            // Set the paper metadata
            paper: {
                title: data.title,
                doi: data.doi,
                authors: data.authors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) })),
                publicationMonth: data.publicationMonth,
                publicationYear: data.publicationYear,
                publishedIn: data.publishedIn,
                researchField: data.selectedResearchField,
                // Set the contributions data
                contributions: data.contributions.allIds.map(c => {
                    const contribution = data.contributions.byId[c];
                    const researhProblem = {
                        [researchProblemPredicate]: contribution.researchProblems.map(rp => {
                            if (rp.hasOwnProperty('existingResourceId') && rp.existingResourceId) {
                                return { '@id': rp.existingResourceId };
                            } else {
                                if (newResearchProblem.includes(rp.id)) {
                                    return { '@id': `_${rp.id}` };
                                } else {
                                    newResearchProblem.push(rp.id);
                                    return { label: rp.label, '@temp': `_${rp.id}` };
                                }
                            }
                        })
                    };
                    return {
                        name: contribution.label,
                        values: Object.assign({}, researhProblem, getResourceObject(data, contribution.resourceId, newProperties))
                    };
                })
            }
        };

        try {
            const paper = await network.saveFullPaper(paperObj);
            dispatch({
                type: type.SAVE_ADD_PAPER,
                id: paper.id
            });

            dispatch({
                type: type.ADD_PAPER_UNBLOCK_NAVIGATION
            });
        } catch (e) {
            console.log(e);
            toast.error('Something went wrong while saving this paper.');
            dispatch({
                type: type.ADD_PAPER_PREVIOUS_STEP
            });
        }
    };
};
