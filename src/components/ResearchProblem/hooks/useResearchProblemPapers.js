import { useState, useEffect, useCallback } from 'react';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { useParams } from 'react-router-dom';
import { getPaperData } from 'utils';
import { uniq } from 'lodash';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

function useResearchProblemPapers() {
    const pageSize = 10;
    const { researchProblemId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(1);
    const [papers, setPapers] = useState([]);

    const loadPapers = useCallback(
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

                    // get papers
                    const papersResourcesCalls = contributions.map(
                        contribution =>
                            getStatementsByObjectAndPredicate({
                                objectId: contribution.id,
                                predicateId: PREDICATES.HAS_CONTRIBUTION,
                                order: 'desc'
                            })
                                .then(pItems =>
                                    pItems
                                        .filter(pItem => pItem.subject.classes.includes(CLASSES.PAPER))
                                        .map(pItem => ({ contribution: contribution, ...pItem.subject }))
                                )
                                .then(pItems => (pItems.length ? pItems[0] : null)) // if there is no paper set null
                    );

                    // Get the data of each paper
                    Promise.all(papersResourcesCalls)
                        .then(items => items.filter(Boolean)) // to remove contribution that are not related to a paper
                        .then(papersResources => {
                            return getStatementsBySubjects({
                                ids: uniq(papersResources.map(paperResource => paperResource.id)) // use bulk fetch to reduce and optimize the number of calls
                            }).then(papersStatements => {
                                const data = [];
                                for (const papersResource of papersResources) {
                                    const statements = papersStatements.filter(paperStatements => paperStatements.id === papersResource.id)[0]
                                        .statements;
                                    data.push({
                                        ...papersResource,
                                        data: getPaperData(papersResource.id, papersResource.label, statements)
                                    });
                                }
                                return data;
                            });
                        })
                        .then(papersData => {
                            setPapers(prevResources => [...prevResources, ...papersData]);
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
        setPapers([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(1);
    }, [researchProblemId]);

    useEffect(() => {
        loadPapers(1);
    }, [loadPapers]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadPapers(page);
        }
    };

    return [papers, isLoading, hasNextPage, isLastPageReached, handleLoadMore];
}
export default useResearchProblemPapers;
