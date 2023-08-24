import useObservatoryFilters from 'components/Observatory/hooks/useObservatoryFilters';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import ROUTES from 'constants/routes.js';
import { find, flatten, isArray } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContentByObservatoryIdAndClasses, getPapersByObservatoryIdAndFilters } from 'services/backend/observatories';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate, reverseWithSlug } from 'utils';

function useObservatoryContent({ observatoryId, slug, initialSort, initialClassFilterOptions, initClassesFilter, pageSize = 30, updateURL = false }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [items, setItems] = useState([]);
    const [sort, setSort] = useState(initialSort);
    const [classFilterOptions] = useState(initialClassFilterOptions);
    const [classesFilter, setClassesFilter] = useState(initClassesFilter);
    const [totalElements, setTotalElements] = useState(0);
    const navigate = useNavigate();

    const { isLoading: isLoadingFilters, filters, refreshFilter, setFilters } = useObservatoryFilters({ id: observatoryId });

    const loadData = useCallback(
        (page, activeFilters = []) => {
            setIsLoading(true);
            let contentService;
            if (activeFilters.length === 0) {
                if (sort === 'combined') {
                    // in case of combined sort we list 50% featured and 50% unfeatured items
                    const noFeaturedContentService = getContentByObservatoryIdAndClasses({
                        id: observatoryId,
                        page,
                        items: Math.round(pageSize / 2),
                        sortBy: 'created_at',
                        desc: true,
                        visibility: VISIBILITY_FILTERS.NON_FEATURED,
                        classes: classesFilter.map(c => c.id),
                    });
                    const featuredContentService = getContentByObservatoryIdAndClasses({
                        id: observatoryId,
                        page,
                        items: Math.round(pageSize / 2),
                        sortBy: 'created_at',
                        desc: true,
                        visibility: VISIBILITY_FILTERS.FEATURED,
                        classes: classesFilter.map(c => c.id),
                    });
                    contentService = Promise.all([noFeaturedContentService, featuredContentService]).then(([noFeaturedContent, featuredContent]) => {
                        const combinedComparisons = mergeAlternate(noFeaturedContent.content, featuredContent.content);
                        return {
                            content: combinedComparisons,
                            totalElements: noFeaturedContent.totalElements + featuredContent.totalElements,
                            last: noFeaturedContent.last && featuredContent.last,
                        };
                    });
                } else {
                    contentService = getContentByObservatoryIdAndClasses({
                        id: observatoryId,
                        page,
                        items: pageSize,
                        sortBy: 'created_at',
                        desc: true,
                        visibility: sort,
                        classes: classesFilter.map(c => c.id),
                    }).then(response => ({ ...response, content: response.content }));
                }
            } else {
                contentService = getPapersByObservatoryIdAndFilters({
                    id: observatoryId,
                    page: 0,
                    items: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    filters: activeFilters,
                }).then(response => ({ ...response, content: response.content }));
            }

            contentService
                .then(result => {
                    // Fetch the data of each content
                    getStatementsBySubjects({
                        ids: result.content.map(p => p.id),
                    })
                        .then(contentsStatements => {
                            const dataObjects = contentsStatements.map(statements => {
                                const resourceSubject = find(result.content, {
                                    id: statements.id,
                                });
                                return getDataBasedOnType(resourceSubject, statements.statements);
                            });
                            setItems(prevResources => {
                                let newItems = groupVersionsOfComparisons([
                                    ...flatten([...prevResources.map(c => c.versions ?? []), ...prevResources]),
                                    ...dataObjects,
                                ]);
                                if (sort === 'combined') {
                                    newItems = mergeAlternate(
                                        newItems.filter(i => i.featured),
                                        newItems.filter(i => !i.featured),
                                    );
                                }
                                return flatten([...prevResources, newItems.filter(t => t && !prevResources.map(p => p.id).includes(t.id))]);
                            });

                            setIsLoading(false);
                            setHasNextPage(!result.last);
                            setIsLastPageReached(result.last);
                            setTotalElements(result.totalElements);
                            setCurrentPage(page + 1);
                        })
                        .catch(error => {
                            setIsLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(page > 1);

                            console.log(error);
                        });
                })
                .catch(error => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1);

                    console.log(error);
                });
        },
        [sort, observatoryId, pageSize, classesFilter],
    );

    // reset resources when the observatoryId has changed
    useEffect(() => {
        setItems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setCurrentPage(0);
        setTotalElements(0);
    }, [observatoryId, sort, classesFilter]);

    // update url
    useEffect(() => {
        if (updateURL) {
            navigate(
                `${reverseWithSlug(ROUTES.OBSERVATORY, {
                    id: slug,
                })}?sort=${sort}&classesFilter=${classesFilter.map(c => c.id).join(',')}`,
                { replace: true },
            );
        }
    }, [observatoryId, slug, sort, classesFilter, navigate, updateURL]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(currentPage);
        }
    };

    const showResult = () => {
        let activeFilters = filters.filter(f => f.value);
        activeFilters = filters.map(f => {
            if (isArray(f.value)) {
                return { path: f.path, range: f.range, value: f.value.map(v => v.id) };
            }
            return { path: f.path, range: f.range, value: f.value };
        });
        setItems([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setCurrentPage(0);
        setTotalElements(0);
        loadData(0, activeFilters);
    };

    return {
        items,
        isLoading,
        hasNextPage,
        isLastPageReached,
        sort,
        totalElements,
        page: currentPage,
        classFilterOptions,
        classesFilter,
        filters,
        isLoadingFilters,
        refreshFilter,
        setFilters,
        setClassesFilter,
        handleLoadMore,
        setSort,
        showResult,
    };
}
export default useObservatoryContent;
