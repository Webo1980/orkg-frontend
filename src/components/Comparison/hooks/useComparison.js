import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import THING_TYPES from 'constants/thingTypes';
import { uniq, without } from 'lodash';
import { reverse } from 'named-urls';
import qs from 'qs';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubject, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getComparison, getThing } from 'services/similarity';
import {
    extendAndSortProperties,
    setComparisonResource,
    setConfiguration,
    setConfigurationAttribute,
    setContributions,
    setData,
    setErrors,
    setFilterControlData,
    setHasPreviousVersion,
    setHiddenGroups,
    setIsEmbeddedMode,
    setIsFailedLoadingMetadata,
    setIsFailedLoadingResult,
    setIsLoadingMetadata,
    setIsLoadingResult,
    setProperties,
    setResearchField,
} from 'slices/comparisonSlice';
import { DEFAULT_COMPARISON_METHOD } from 'constants/misc';
import { asyncLocalStorage, getArrayParamFromQueryString, getComparisonData, getErrorMessage, getParamFromQueryString } from 'utils';
import { generateFilterControlData, getComparisonURLFromConfig } from './helpers';

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
    const contributions = useSelector(state => state.comparison.contributions);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);
    const data = useSelector(state => state.comparison.data);
    const properties = useSelector(state => state.comparison.properties);

    /**
     * Load comparison meta data and comparison config
     *
     * @param {String} cId comparison ID
     */
    const loadComparisonMetaData = useCallback(
        cId => {
            if (cId) {
                dispatch(setIsLoadingMetadata(true));
                // Get the comparison resource
                getResource(cId)
                    .then(_comparisonResource => {
                        // Make sure that this resource is a comparison
                        if (!_comparisonResource.classes.includes(CLASSES.COMPARISON)) {
                            throw new Error(`The requested resource is not of class "${CLASSES.COMPARISON}".`);
                        }
                        return _comparisonResource;
                    })
                    .then(_comparisonResource => {
                        // Get meta data and config of a comparison
                        getStatementsBySubject({ id: cId }).then(statements => {
                            const comparisonObject = getComparisonData(_comparisonResource, statements);
                            dispatch(setComparisonResource(comparisonObject));
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

    /**
     * Call the comparison service to get the comparison result
     */
    const getComparisonResult = useCallback(
        contributionsIDs => {
            dispatch(setIsLoadingResult(true));
            let simCompCall = null;
            if (comparisonId) {
                simCompCall = getThing({ thingType: THING_TYPES.COMPARISON, thingKey: comparisonId });
            } else {
                simCompCall = getComparison({ contributionIds: contributionsIDs, type: comparisonType });
            }

            simCompCall
                .then(async _comparisonData => {
                    let comparisonData;
                    if (comparisonId) {
                        comparisonData = _comparisonData.data;
                        dispatch(
                            setConfiguration({
                                ..._comparisonData.config,
                                comparisonType: _comparisonData.config.type,
                                predicatesList: _comparisonData.config.predicates,
                                contributionsList: _comparisonData.config.contributions,
                            }),
                        );
                    } else {
                        comparisonData = _comparisonData;
                    }
                    comparisonData.properties = comparisonData.predicates;

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
                    dispatch(setProperties(comparisonData.properties));
                    dispatch(setData(comparisonData.data));
                    dispatch(
                        setFilterControlData(generateFilterControlData(comparisonData.contributions, comparisonData.properties, comparisonData.data)),
                    );
                    dispatch(setIsLoadingResult(false));
                    dispatch(setIsFailedLoadingResult(false));
                })
                .catch(error => {
                    console.log(error);
                    dispatch(setErrors(getErrorMessage(error)));
                    dispatch(setIsLoadingResult(false));
                    dispatch(setIsFailedLoadingResult(true));
                });
        },
        [comparisonId, comparisonType, contributionsList, dispatch],
    );

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
        const qParams = getComparisonURLFromConfig({
            contributions: _contributionsList,
            predicates: _predicatesList.map(predicate => encodeURIComponent(predicate)),
            type: _comparisonType,
            transpose: _transpose,
            hasPreviousVersion,
        });
        navigate(`${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}${qParams}`);
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
        if (comparisonId !== undefined && !qs.parse(search, { ignoreQueryPrefix: true })?.noResource) {
            loadComparisonMetaData(comparisonId);
            getComparisonResult();
        } else {
            // Update browser title
            document.title = 'Comparison - ORKG';

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
            getComparisonResult(contributionsIDs);
        }
    }, [comparisonId, dispatch, loadComparisonMetaData, search]);

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
