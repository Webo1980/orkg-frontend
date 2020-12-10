import { useState, useEffect, useCallback } from 'react';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { useParams } from 'react-router-dom';
import { getComparisonData } from 'utils';
import { uniqBy } from 'lodash';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

function useResearchProblemComparisons() {
    const pageSize = 50;
    const { researchProblemId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [comparisons, setComparisons] = useState([]);

    const loadComparisons = useCallback(
        page => {
            setIsLoading(true);

            // Get the statements that contains the research problem as an object
            getStatementsByObjectAndPredicate({
                objectId: researchProblemId,
                predicateId: PREDICATES.HAS_RESEARCH_PROBLEM,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // Contributions
                if (result.length > 0) {
                    const contributions = result
                        .filter(contribution => contribution.subject.classes.includes(CLASSES.CONTRIBUTION))
                        .map(contribution => contribution.subject);

                    // get comparisons
                    const comparisonsResourcesCalls = contributions.map(
                        contribution =>
                            getStatementsByObjectAndPredicate({
                                objectId: contribution.id,
                                predicateId: PREDICATES.COMPARE_CONTRIBUTION,
                                order: 'desc'
                            })
                                .then(pItems =>
                                    pItems
                                        .filter(pItem => pItem.subject.classes.includes(CLASSES.COMPARISON))
                                        .map(pItem => ({ contribution: contribution, ...pItem.subject }))
                                )
                                .then(pItems => (pItems.length ? pItems[0] : null)) // if there is no comparison set null
                    );

                    // Get the data of each comparison
                    Promise.all(comparisonsResourcesCalls)
                        .then(items => items.filter(Boolean)) // to remove contribution that are not related to a comparison
                        .then(comparisonsResources => {
                            return getStatementsBySubjects({
                                ids: uniqBy(comparisonsResources, 'id').map(comparisonResource => comparisonResource.id) // use bulk fetch to reduce and optimize the number of calls
                            }).then(comparisonsStatements => {
                                const data = [];
                                for (const comparisonResource of comparisonsResources) {
                                    const statements = comparisonsStatements.filter(
                                        comparisonStatements => comparisonStatements.id === comparisonResource.id
                                    )[0].statements;
                                    data.push({
                                        ...comparisonResource,
                                        data: getComparisonData(comparisonResource.id, comparisonResource.label, statements)
                                    });
                                }

                                return data;
                            });
                        })
                        .then(comparisonsData => {
                            setComparisons(prevResources => [...prevResources, ...comparisonsData]);
                            setIsLoading(false);
                            // use result instead of results because filtering by contribution class might reduce the number of items
                            setHasNextPage(result.length < pageSize || result.length === 0 ? false : true);
                            setIsLastPageReached(false);
                            setPage(page + 1);
                        });
                } else {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1 ? true : false);
                }
            });
        },
        [researchProblemId]
    );

    // reset resources when the researchProblemId has changed
    useEffect(() => {
        setComparisons([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchProblemId]);

    useEffect(() => {
        loadComparisons(1);
    }, [loadComparisons]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadComparisons(page);
        }
    };

    return [comparisons, isLoading, hasNextPage, isLastPageReached, handleLoadMore];
}
export default useResearchProblemComparisons;
