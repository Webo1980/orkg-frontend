import { useEffect, useCallback } from 'react';
import {
    getStatementsBySubject,
    getStatementsBySubjectAndPredicate,
    getStatementsBundleBySubject,
    getStatementsByObject,
} from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { getComparison, getResourceData } from 'services/similarity/index';
import {
    setComparisonResource,
    setResearchField,
    setConfiguration,
    setHasPreviousVersion,
    setConfigurationAttribute,
    setProperties,
    setContributions,
    setData,
    setFilterControlData,
    setIsFailedLoadingMetadata,
    setIsLoadingMetadata,
    setIsLoadingResult,
    setIsFailedLoadingResult,
    setErrors,
    extendAndSortProperties,
    setHiddenGroups,
    setIsEmbeddedMode,
    setContributionStatements,
    setExpandedPropertyPaths,
} from 'slices/comparisonSlice';
import {
    filterObjectOfStatementsByPredicateAndClass,
    getArrayParamFromQueryString,
    getParamFromQueryString,
    getErrorMessage,
    getComparisonData,
    asyncLocalStorage,
    getPaperData,
} from 'utils';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { flatten, uniq, without } from 'lodash';
import ROUTES from 'constants/routes.js';
import qs from 'qs';
import { useSelector, useDispatch } from 'react-redux';
import useComparisonPropertyPath from 'components/Comparison/Table/hooks/useComparisonPropertyPath';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getComparisonConfiguration, generateFilterControlData } from './helpers';

const DEFAULT_COMPARISON_METHOD = 'property-path';

function useComparison({ id, isEmbeddedMode = false }) {
    const { search } = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const comparisonId = id || params.comparisonId;
    const hiddenGroupsStorageName = comparisonId ? `comparison-${comparisonId}-hidden-rows` : null;

    const dispatch = useDispatch();
    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const predicatesList = useSelector(state => state.comparison.configuration.predicatesList);
    const transpose = useSelector(state => state.comparison.configuration.transpose);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);
    const responseHash = useSelector(state => state.comparison.configuration.responseHash);
    const contributions = useSelector(state => state.comparison.contributions);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);
    const data = useSelector(state => state.comparison.data);
    const properties = useSelector(state => state.comparison.properties);
    const { getUniqueProperties } = useComparisonPropertyPath();
    /**
     * Load comparison meta data and comparison config
     *
     * @param {String} cId comparison ID
     */
    const loadComparisonMetaData = useCallback(
        cId => {
            if (cId) {
                dispatch(setIsLoadingMetadata(true));
                // Get the comparison resource and comparison config
                Promise.all([getResource(cId), getResourceData(cId)])
                    .then(([_comparisonResource, configurationData]) => {
                        // Make sure that this resource is a comparison
                        if (!_comparisonResource.classes.includes(CLASSES.COMPARISON)) {
                            throw new Error(`The requested resource is not of class "${CLASSES.COMPARISON}".`);
                        }
                        return [_comparisonResource, configurationData];
                    })
                    .then(([_comparisonResource, configurationData]) => {
                        // Get meta data and config of a comparison
                        getStatementsBySubject({ id: cId }).then(statements => {
                            const comparisonObject = getComparisonData(_comparisonResource, statements);
                            dispatch(setComparisonResource(comparisonObject));

                            const { url } = configurationData.data;
                            if (url) {
                                dispatch(setConfiguration(getComparisonConfiguration(url)));
                            } else {
                                dispatch(
                                    setConfigurationAttribute({
                                        attribute: 'predicatesList',
                                        value: filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_PROPERTY, false)?.map(
                                            p => p.id,
                                        ),
                                    }),
                                );
                                const contributionsIDs =
                                    without(
                                        uniq(
                                            filterObjectOfStatementsByPredicateAndClass(
                                                statements,
                                                PREDICATES.COMPARE_CONTRIBUTION,
                                                false,
                                                CLASSES.CONTRIBUTION,
                                            )?.map(c => c.id) ?? [],
                                        ),
                                        undefined,
                                        null,
                                        '',
                                    ) ?? [];
                                dispatch(setConfigurationAttribute({ attribute: 'contributionsList', value: contributionsIDs }));
                            }
                            if (
                                !filterObjectOfStatementsByPredicateAndClass(
                                    statements,
                                    PREDICATES.COMPARE_CONTRIBUTION,
                                    false,
                                    CLASSES.CONTRIBUTION,
                                )?.map(c => c.id)
                            ) {
                                dispatch(setIsLoadingResult(false));
                            }
                            dispatch(setIsLoadingMetadata(false));
                            dispatch(setIsFailedLoadingMetadata(false));
                        });
                    })
                    .catch(error => {
                        let errorMessage = null;
                        if (error.statusCode && error.statusCode === 404) {
                            errorMessage = 'The requested resource is not found';
                        } else {
                            errorMessage = getErrorMessage(error);
                        }
                        dispatch(setErrors(errorMessage));
                        dispatch(setIsLoadingMetadata(false));
                        dispatch(setIsFailedLoadingMetadata(true));
                    });
            } else {
                dispatch(setIsLoadingMetadata(false));
                dispatch(setIsFailedLoadingMetadata(true));
            }
        },
        [dispatch],
    );

    const getDataForPropertyPathComparison = useCallback(async () => {
        try {
            dispatch(setIsLoadingResult(true));

            // create the columns, fetch data related to papers
            let paperStatements = contributionsList.map(objectId =>
                getStatementsByObjectAndPredicate({ objectId, predicateId: PREDICATES.HAS_CONTRIBUTION }),
            );
            paperStatements = flatten(await Promise.all(paperStatements));

            const _contributions = paperStatements.map(statement => ({
                contributionLabel: statement.object.label,
                id: statement.object.id,
                paperId: statement.subject.id,
                title: statement.subject.label,
                active: true,
            }));
            dispatch(setContributions(_contributions));

            // the rest of the data
            const allStatementPromise = contributionsList.map(resourceId => getStatementsBundleBySubject({ id: resourceId, maxLevel: 20 }));
            const allStatements = await Promise.all(allStatementPromise);
            dispatch(setContributionStatements(allStatements));
            const uniqueProperties = getUniqueProperties(allStatements);
            const firstLevelPropertyIds = uniqueProperties.filter(p => p.path.length === 1).map(p => [p.id]);
            dispatch(setExpandedPropertyPaths(firstLevelPropertyIds));
            dispatch(setProperties(uniqueProperties));

            dispatch(setIsFailedLoadingResult(false));
        } catch (e) {
            dispatch(setIsFailedLoadingResult(true));
        } finally {
            dispatch(setIsLoadingResult(false));
        }
    }, [contributionsList, dispatch, getUniqueProperties]);

    /**
     * Call the comparison service to get the comparison result
     */
    const getComparisonResult = useCallback(() => {
        dispatch(setIsLoadingResult(true));
        // probably this is not needed for comparisonType === 'property-path'
        getComparison({ contributionIds: contributionsList, type: comparisonType, response_hash: responseHash, save_response: false })
            .then(async comparisonData => {
                // mocking function to allow for deletion of contributions via the url
                comparisonData.contributions.forEach((contribution, index) => {
                    if (contributionsList?.length > 0 && !contributionsList.includes(contribution.id)) {
                        comparisonData.contributions[index].active = false;
                    } else {
                        comparisonData.contributions[index].active = true;
                    }
                });

                comparisonData.properties = await dispatch(extendAndSortProperties(comparisonData, comparisonType));

                dispatch(setContributions(comparisonData.contributions));

                dispatch(setIsLoadingResult(false));
                dispatch(setIsFailedLoadingResult(false));
                dispatch(setData(comparisonData.data));
                dispatch(
                    setFilterControlData(generateFilterControlData(comparisonData.contributions, comparisonData.properties, comparisonData.data)),
                );
                dispatch(setProperties(comparisonData.properties));

                if (comparisonData.response_hash) {
                    dispatch(setConfigurationAttribute({ attribute: 'responseHash', value: comparisonData.response_hash }));
                } else {
                    dispatch(setConfigurationAttribute({ attribute: 'responseHash', value: responseHash }));
                }
            })
            .catch(error => {
                console.log(error);
                dispatch(setErrors(getErrorMessage(error)));
                dispatch(setIsLoadingResult(false));
                dispatch(setIsFailedLoadingResult(true));
            });
    }, [comparisonType, contributionsList, responseHash, dispatch]);

    /**
     * Update the URL
     */
    const navigateToNewURL = ({
        _contributionsList = contributionsList,
        _predicatesList = predicatesList,
        _comparisonType = comparisonType,
        _transpose = transpose,
        hasPreviousVersion = comparisonResource?.id || comparisonResource?.hasPreviousVersion?.id,
    }) => {
        const qParams = qs.stringify(
            {
                contributions: _contributionsList.join(','),
                properties: _predicatesList.map(predicate => encodeURIComponent(predicate)).join(','),
                type: _comparisonType,
                transpose: _transpose,
                hasPreviousVersion,
            },
            {
                skipNulls: true,
                arrayFormat: 'comma',
                encode: false,
            },
        );
        navigate(`${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?${qParams}`);
    };

    useEffect(() => {
        const getHiddenGroup = async () => {
            if (comparisonId && hiddenGroupsStorageName) {
                const _data = await asyncLocalStorage.getItem(hiddenGroupsStorageName);
                try {
                    const parsedData = JSON.parse(_data);
                    if (_data && Array.isArray(parsedData)) {
                        dispatch(setHiddenGroups(parsedData));
                    }
                } catch (e) {}
            }
        };
        getHiddenGroup();
    }, [comparisonId, dispatch, hiddenGroupsStorageName]);

    /**
     * Parse previous version from query param
     */
    useEffect(() => {
        if (!comparisonId && qs.parse(search, { ignoreQueryPrefix: true })?.hasPreviousVersion) {
            getResource(qs.parse(search, { ignoreQueryPrefix: true }).hasPreviousVersion).then(prevVersion =>
                dispatch(setHasPreviousVersion(prevVersion)),
            );
        }
    }, [comparisonId, dispatch, search]);

    /**
     * Get research field of the first contribution if no research field is found
     */
    useEffect(() => {
        // get Research field of the first contributions
        if (!comparisonResource?.researchField && contributions[0]?.paperId) {
            getStatementsBySubjectAndPredicate({
                subjectId: contributions[0]?.paperId,
                predicateId: PREDICATES.HAS_RESEARCH_FIELD,
            }).then(s => {
                if (s.length && !comparisonResource?.researchField) {
                    dispatch(setResearchField(s[0].object));
                }
            });
        }
    }, [comparisonResource?.researchField, contributions, dispatch]);

    /**
     * parse query params and set the configuration
     */
    useEffect(() => {
        if (comparisonId !== undefined) {
            loadComparisonMetaData(comparisonId);
        } else {
            // Update browser title
            document.title = 'Comparison - ORKG';

            dispatch(setConfigurationAttribute({ attribute: 'responseHash', value: getParamFromQueryString(search, 'response_hash') }));
            dispatch(
                setConfigurationAttribute({
                    attribute: 'comparisonType',
                    value: getParamFromQueryString(search, 'type') ?? DEFAULT_COMPARISON_METHOD,
                }),
            );
            dispatch(setConfigurationAttribute({ attribute: 'transpose', value: getParamFromQueryString(search, 'transpose', true) }));
            const contributionsIDs = without(uniq(getArrayParamFromQueryString(search, 'contributions')), undefined, null, '') ?? [];
            dispatch(setConfigurationAttribute({ attribute: 'contributionsList', value: contributionsIDs }));
            dispatch(setConfigurationAttribute({ attribute: 'predicatesList', value: getArrayParamFromQueryString(search, 'properties') }));
        }
    }, [comparisonId, dispatch, loadComparisonMetaData, search]);

    /**
     * Update comparison if:
     *  1/ Contribution list changed
     *  2/ Comparison type changed
     *  3/ Comparison id changed and is not undefined
     */
    useEffect(() => {
        if (comparisonType === 'property-path') {
            getDataForPropertyPathComparison();
        } else if (contributionsList?.length > 0) {
            getComparisonResult();
        }
    }, [comparisonType, contributionsList?.length, getComparisonResult, getDataForPropertyPathComparison]);

    useEffect(() => {
        dispatch(setIsEmbeddedMode(isEmbeddedMode));
    }, [isEmbeddedMode, dispatch]);

    return {
        comparisonResource,
        isLoadingResult,
        data,
        contributions,
        properties,
        navigateToNewURL,
    };
}
export default useComparison;
