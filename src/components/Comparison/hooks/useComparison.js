import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import {
    setComparisonObject,
    clearComparisonId,
    setComparisonSetPreviousVersion,
    setComparisonResearchField,
    setComparisonConfiguration,
    setComparisonContributionList,
    setComparisonPredicatesList,
    setComparisonConfigurationAttribute,
    setComparisonProperties,
    setComparisonContributions,
    setComparisonData,
    setComparisonFilterControlData,
    setComparisonMatrixData,
    setComparisonFailedLoadingMetadata,
    setComparisonLoadingMetadata,
    setComparisonLoadingResult,
    setComparisonFailedLoadingResult,
    setComparisonErrors
} from 'actions/comparison';
import { useSelector, useDispatch } from 'react-redux';
import { getComparison, getResourceData } from 'services/similarity/index';
import {
    filterObjectOfStatementsByPredicateAndClass,
    getArrayParamFromQueryString,
    getParamFromQueryString,
    get_error_message,
    getComparisonData,
    getComparisonConfiguration,
    extendAndSortProperties,
    generateFilterControlData
} from 'utils';
import { useLocation, useHistory } from 'react-router-dom';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { DEFAULT_COMPARISON_METHOD } from 'constants/misc';
import { reverse } from 'named-urls';
import { uniq, without } from 'lodash';
import ROUTES from 'constants/routes.js';
import queryString from 'query-string';
import { usePrevious } from 'react-use';

const useComparison = ({ id = null }) => {
    const location = useLocation();
    const history = useHistory();
    const comparisonId = id;

    // urls
    const [urlNeedsToUpdate, setUrlNeedsToUpdate] = useState(false);
    const [, setPublicURL] = useState(window.location.href);
    const [, setComparisonURLConfig] = useState(window.location.search);
    const [, setShortLink] = useState('');

    const dispatch = useDispatch();
    const comparisonObject = useSelector(state => state.comparison.object);
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const predicatesList = useSelector(state => state.comparison.configuration.predicatesList);
    const transpose = useSelector(state => state.comparison.configuration.transpose);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);
    const responseHash = useSelector(state => state.comparison.configuration.responseHash);
    const data = useSelector(state => state.comparison.data);
    const contributions = useSelector(state => state.comparison.contributions);
    const properties = useSelector(state => state.comparison.properties);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);

    // comparison config
    const [shouldFetchLiveComparison, setShouldFetchLiveComparison] = useState(false);

    // reference to previous comparison type
    const prevComparisonType = usePrevious(comparisonType);

    /**
     * set comparison Public URL
     *
     * This function get the public url of ORKG without any route
     *
     * if the app runs under orkg.org/orkg it will set orkg.org/orkg as public URL
     */
    const updateComparisonPublicURL = () => {
        const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname
            .replace(reverse(ROUTES.COMPARISON, { comparisonId: comparisonId }), '')
            .replace(/\/$/, '')}`;
        setPublicURL(newURL);
    };

    /**
     * Load comparison meta data and comparison config
     *
     * @param {String} cId comparison ID
     */
    const loadComparisonMetaData = useCallback(cId => {
        if (cId) {
            dispatch(setComparisonLoadingMetadata(true));
            // Get the comparison resource and comparison config
            Promise.all([getResource(cId), getResourceData(cId)])
                .then(([comparisonResource, configurationData]) => {
                    // Make sure that this resource is a comparison
                    if (!comparisonResource.classes.includes(CLASSES.COMPARISON)) {
                        throw new Error(`The requested resource is not of class "${CLASSES.COMPARISON}".`);
                    }
                    // Update browser title
                    document.title = `${comparisonResource.label} - Comparison - ORKG`;
                    return [comparisonResource, configurationData];
                })
                .then(([comparisonResource, configurationData]) => {
                    // Get meta data and config of a comparison
                    getStatementsBySubject({ id: cId }).then(statements => {
                        const comparisonObject = getComparisonData(comparisonResource, statements);

                        dispatch(setComparisonObject(comparisonObject));

                        const url = configurationData.data.url;
                        if (url) {
                            dispatch(setComparisonConfiguration(getComparisonConfiguration(url)));
                        } else {
                            dispatch(
                                setComparisonPredicatesList(
                                    filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_PROPERTY, false)?.map(p => p.id)
                                )
                            );
                            const contributionsIDs =
                                without(
                                    uniq(
                                        filterObjectOfStatementsByPredicateAndClass(
                                            statements,
                                            PREDICATES.COMPARE_CONTRIBUTION,
                                            false,
                                            CLASSES.CONTRIBUTION
                                        )?.map(c => c.id) ?? []
                                    ),
                                    undefined,
                                    null,
                                    ''
                                ) ?? [];
                            dispatch(setComparisonContributionList(contributionsIDs));
                        }
                        if (
                            !filterObjectOfStatementsByPredicateAndClass(
                                statements,
                                PREDICATES.COMPARE_CONTRIBUTION,
                                false,
                                CLASSES.CONTRIBUTION
                            )?.map(c => c.id)
                        ) {
                            dispatch(setComparisonLoadingResult(false));
                        }
                        dispatch(setComparisonLoadingMetadata(false));
                        dispatch(setComparisonFailedLoadingMetadata(false));
                    });
                })
                .catch(error => {
                    let errorMessage = null;
                    if (error.statusCode && error.statusCode === 404) {
                        errorMessage = 'The requested resource is not found';
                    } else {
                        errorMessage = get_error_message(error);
                    }
                    dispatch(setComparisonErrors(errorMessage));
                    dispatch(setComparisonLoadingMetadata(false));
                    dispatch(setComparisonFailedLoadingMetadata(true));
                });
        } else {
            dispatch(setComparisonLoadingMetadata(false));
            dispatch(setComparisonFailedLoadingMetadata(true));
        }
    }, []);

    /**
     * Call the comparison service to get the comparison result
     */
    const getComparisonResult = useCallback(() => {
        dispatch(setComparisonLoadingResult(true));
        getComparison({ contributionIds: contributionsList, type: comparisonType, response_hash: responseHash, save_response: false })
            .then(comparisonData => {
                // get Research field of the first contributions
                return getStatementsBySubjectAndPredicate({
                    subjectId: comparisonData.contributions[0].paperId,
                    predicateId: PREDICATES.HAS_RESEARCH_FIELD
                }).then(s => {
                    if (s.length && !comparisonObject?.researchField) {
                        dispatch(setComparisonResearchField(s[0].object));
                    }
                    return Promise.resolve(comparisonData);
                });
            })
            .then(comparisonData => {
                // mocking function to allow for deletion of contributions via the url
                comparisonData.contributions.forEach((contribution, index) => {
                    if (!contributionsList.includes(contribution.id)) {
                        comparisonData.contributions[index].active = false;
                    } else {
                        comparisonData.contributions[index].active = true;
                    }
                });

                comparisonData.properties = extendAndSortProperties(comparisonData, predicatesList);

                dispatch(setComparisonContributions(comparisonData.contributions));
                dispatch(setComparisonProperties(comparisonData.properties));
                dispatch(setComparisonData(comparisonData.data));
                dispatch(
                    setComparisonFilterControlData(
                        generateFilterControlData(comparisonData.contributions, comparisonData.properties, comparisonData.data)
                    )
                );
                dispatch(setComparisonLoadingResult(false));
                dispatch(setComparisonFailedLoadingResult(false));

                if (comparisonData.response_hash) {
                    dispatch(setComparisonConfigurationAttribute('responseHash', comparisonData.response_hash));
                } else {
                    dispatch(setComparisonConfigurationAttribute('responseHash', responseHash));
                }
            })
            .then(() => {
                if (!comparisonId && queryString.parse(location.search)?.hasPreviousVersion) {
                    getResource(queryString.parse(location.search).hasPreviousVersion).then(prevVersion =>
                        dispatch(setComparisonSetPreviousVersion(prevVersion))
                    );
                }
            })
            .catch(error => {
                console.log(error);
                dispatch(setComparisonErrors(get_error_message(error)));
                dispatch(setComparisonLoadingResult(false));
                dispatch(setComparisonFailedLoadingResult(true));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comparisonType, contributionsList, responseHash]);

    /**
     * Update the URL
     */
    const generateUrl = () => {
        const params = queryString.stringify(
            {
                contributions: contributionsList.join(','),
                properties: predicatesList.map(predicate => encodeURIComponent(predicate)).join(','),
                type: comparisonType,
                transpose: transpose
            },
            {
                skipNull: true,
                skipEmptyString: true,
                encode: false
            }
        );
        setComparisonURLConfig(`?${params}`);
        setShortLink('');
        history.push(reverse(ROUTES.COMPARISON) + `?${params}`);
    };

    /**
     * Create a tabular data of the comparison
     */
    const generateMatrixOfComparison = useCallback(() => {
        const header = ['Title'];

        for (const property of properties) {
            if (property.active) {
                header.push(property.label);
            }
        }

        const rows = [];

        for (let i = 0; i < contributions.length; i++) {
            const contribution = contributions[i];
            if (contribution.active) {
                const row = [contribution.title];

                for (const property of properties) {
                    if (property.active) {
                        let value = '';
                        if (data[property.id]) {
                            // separate labels with comma
                            value = data[property.id][i].map(entry => entry.label).join(', ');
                            row.push(value);
                        }
                    }
                }
                rows.push(row);
            }
        }
        dispatch(setComparisonMatrixData([header, ...rows]));
    }, [contributions, data, dispatch, properties]);

    useEffect(() => {
        // only is there is no hash, live comparison data can be fetched
        if (shouldFetchLiveComparison && !responseHash) {
            setShouldFetchLiveComparison(false);
            getComparisonResult();
        }
    }, [getComparisonResult, responseHash, shouldFetchLiveComparison]);

    useEffect(() => {
        if (comparisonId !== undefined) {
            loadComparisonMetaData(comparisonId);
        } else {
            // Update browser title
            document.title = 'Comparison - ORKG';
            dispatch(
                setComparisonConfigurationAttribute(
                    'responseHash',
                    comparisonObject?.hasPreviousVersion?.id && responseHash
                        ? responseHash
                        : getParamFromQueryString(location.search, 'response_hash')
                )
            );
            dispatch(
                setComparisonConfigurationAttribute('comparisonType', getParamFromQueryString(location.search, 'type') ?? DEFAULT_COMPARISON_METHOD)
            );

            dispatch(setComparisonConfigurationAttribute('transpose', getParamFromQueryString(location.search, 'transpose', true)));
            const contributionsIDs = without(uniq(getArrayParamFromQueryString(location.search, 'contributions')), undefined, null, '') ?? [];
            dispatch(setComparisonContributionList(contributionsIDs));
            dispatch(setComparisonPredicatesList(getArrayParamFromQueryString(location.search, 'properties')));
        }
        updateComparisonPublicURL();
    }, [comparisonId, loadComparisonMetaData]);

    /**
     * Update comparison if:
     *  1/ Contribution list changed
     *  2/ Comparison type changed
     */
    useEffect(() => {
        if (
            contributionsList.length > 0 &&
            (prevComparisonType !== comparisonType || !contributionsList.every(id => contributions.map(c => c.id).includes(id)))
        ) {
            getComparisonResult();
        }
    }, [comparisonType, contributionsList.length]);

    /**
     * Update URL if
     *  1/ Property list change
     *  2/ Contribution list change
     *  3/ Comparison type change
     */
    useEffect(() => {
        if (urlNeedsToUpdate) {
            generateUrl();
            if (comparisonObject.id) {
                dispatch(clearComparisonId());
            }
            setUrlNeedsToUpdate(false);
            generateMatrixOfComparison();
        }
    }, [transpose, responseHash, comparisonType, urlNeedsToUpdate]);

    /**
     * Update Matrix of comparison
     *  1/ isLoadingResult is false (finished loading)
     */
    useEffect(() => {
        if (!isLoadingResult) {
            generateMatrixOfComparison();
        }
    }, [generateMatrixOfComparison, isLoadingResult]);

    return { comparisonObject };
};
export default useComparison;
