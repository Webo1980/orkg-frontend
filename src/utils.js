import capitalize from 'capitalize';
import { mergeWith, isArray } from 'lodash';

export const popupDelay = process.env.REACT_APP_POPUP_DELAY;

export function hashCode(s) {
    return s.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
    }, 0);
}

export function groupBy(array, group) {
    const hash = Object.create(null);
    const result = [];

    array.forEach(a => {
        const groupByElement = a[group];
        if (!hash[groupByElement]) {
            hash[groupByElement] = [];
            result.push(hash[groupByElement]);
        }
        hash[groupByElement].push(a);
    });

    return result;
}

export function groupByObjectWithId(array, propertyName) {
    const hash = Object.create(null);
    const result = [];

    array.forEach(a => {
        const groupId = a[propertyName].id;
        if (!hash[groupId]) {
            hash[groupId] = [];
            result.push(hash[groupId]);
        }
        hash[groupId].push(a);
    });

    return result;
}

export function deleteArrayEntryByObjectValue(arr, object, value) {
    let newArr = [...arr];

    var indexToDelete = -1;

    for (let i = 0; i < newArr.length; i++) {
        if (newArr[i][object] === value) {
            indexToDelete = i;
            break;
        }
    }

    if (indexToDelete > -1) {
        newArr.splice(indexToDelete, 1);
    }

    return newArr;
}

export const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

export const range = (start, end) => {
    return [...Array(1 + end - start).keys()].map(v => start + v);
};

export function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Promise timeout'));
        }, ms);
        promise.then(
            res => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            err => {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    });
}

/**
 * Parse error response body (originating from server) by field name
 *
 * Not specifying a `field` name will return the global `errors.message`
 *
 * @param {Object} errors
 * @param {String} field
 */
export const get_error_message = (errors, field = null) => {
    if (!errors) {
        return null;
    }
    if (field === null) {
        return Boolean(errors.message) ? capitalize(errors.message) : null;
    }
    let field_error = errors.errors ? errors.errors.find(e => e.field === field) : null;
    return field_error ? capitalize(field_error.message) : null;
};

/**
 * Get Resource Object
 *
 * @param {Object} errors
 * @param {String} field
 */
// The function to customize merging objects (to handle using the same existing predicate twice in the same ressource)
function customizer(objValue, srcValue) {
    if (isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}
export const getResourceObject = (data, resourceId) => {
    // Make a list of new resources ids
    let newResources = data.values.allIds
        .filter(valueId => !data.values.byId[valueId].isExistingValue)
        .map(valueId => data.values.byId[valueId].resourceId);
    return mergeWith(
        {},
        ...data.resources.byId[resourceId].propertyIds.map(propertyId => {
            let property = data.properties.byId[propertyId];
            return {
                // Map properties of resource
                [property.existingPredicateId ? property.existingPredicateId : `_${propertyId}`]: property.valueIds.map(valueId => {
                    let value = data.values.byId[valueId];
                    if (value.type === 'literal' && !value.isExistingValue) {
                        return {
                            text: value.label
                        };
                    } else {
                        if (!value.isExistingValue) {
                            let newResources = {};
                            newResources[value.resourceId] = value.resourceId;
                            return {
                                '@temp': `_${value.resourceId}`,
                                label: value.label,
                                values: Object.assign({}, getResourceObject(data, value.resourceId))
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

/**
 * Get paper Object
 *
 * @param {Object} errors
 * @param {String} field
 */
export const getPaperObject = data => {
    const researchProblemPredicate = process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM;

    return {
        // Set new predicates label and temp ID
        predicates: data.properties.allIds
            .filter(propertyId => !data.properties.byId[propertyId].existingPredicateId)
            .map(propertyId => {
                let property = data.properties.byId[propertyId];
                return {
                    [property.label]: `_${propertyId}`
                };
            }),
        // Set the paper metadata
        paper: {
            title: data.title,
            doi: data.doi,
            authors: data.authors.map(author => ({ label: author.label })),
            publicationMonth: data.publicationMonth,
            publicationYear: data.publicationYear,
            researchField: data.selectedResearchField,
            // Set the contributions data
            contributions: data.contributions.allIds.map(c => {
                let contribution = data.contributions.byId[c];
                let researhProblem = {
                    [researchProblemPredicate]: contribution.researchProblems.map(rp => {
                        if (rp.hasOwnProperty('_class') && rp._class === 'resource') {
                            return { '@id': rp.id };
                        } else {
                            return { label: rp.label };
                        }
                    })
                };
                return {
                    name: contribution.label,
                    values: Object.assign({}, researhProblem, getResourceObject(data, contribution.resourceId))
                };
            })
        }
    };
};

/*
 * Parse paper statements and return a a paper object
 *
 * @param {Array} paperStatements
 */
export const get_paper_data = paperStatements => {
    // research field
    let researchField = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);
    if (researchField.length > 0) {
        researchField = researchField[0];
    }
    // publication year
    let publicationYear = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);
    if (publicationYear.length > 0) {
        publicationYear = publicationYear[0].object.label;
    } else {
        publicationYear = '';
    }
    // publication month
    let publicationMonth = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);
    if (publicationMonth.length > 0) {
        publicationMonth = publicationMonth[0].object.label;
    } else {
        publicationMonth = '';
    }
    // authors
    let authors = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);
    let authorNamesArray = [];
    if (authors.length > 0) {
        for (let author of authors) {
            authorNamesArray.push({
                id: author.object.id,
                statementId: author.id,
                class: author.object._class,
                label: author.object.label,
                classes: author.object.classes,
                created_at: author.created_at
            });
        }
    }
    // DOI
    let doi = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_DOI);
    let doiResourceId = 0;
    if (doi.length > 0) {
        doiResourceId = doi[0].object.id;
        doi = doi[0].object.label;

        if (doi.includes('10.') && !doi.startsWith('10.')) {
            doi = doi.substring(doi.indexOf('10.'));
        }
    } else {
        doi = null;
    }
    // contributions
    let contributions = paperStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION);
    let contributionArray = [];
    if (contributions.length > 0) {
        for (let contribution of contributions) {
            contributionArray.push({ ...contribution.object, statementId: contribution.id });
        }
    }
    return {
        id: paperStatements[0].subject.id,
        label: paperStatements[0].subject.label,
        publicationYear,
        publicationMonth,
        researchField,
        doi,
        doiResourceId,
        authorNames: authorNamesArray.sort((a, b) => a.created_at.localeCompare(b.created_at)),
        contributions: contributionArray.sort((a, b) => a.label.localeCompare(b.label))
    };
};
