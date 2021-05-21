import { load as loadArticle } from 'actions/smartReview';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getResource } from 'services/backend/resources';
import { getStatementsBundleBySubject, getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { getResourceData } from 'services/similarity';
import { countBy, orderBy } from 'lodash';

const useLoad = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const dispatch = useDispatch();

    const getArticleById = useCallback(async id => {
        let paperResource = await getResource(id).catch(e => {});
        let isPublished = false;
        if (!paperResource) {
            notFound();
            return;
        }

        let paperStatements = [];

        // for published articles
        if (paperResource.classes.includes(CLASSES.SMART_REVIEW_PUBLISHED)) {
            const resourceData = await getResourceData(id).catch(e => {});
            if (!resourceData) {
                console.log('no resource data found');
                notFound();
                return;
            }
            const {
                data: { rootResource, statements }
            } = resourceData;
            paperStatements = statements;
            id = rootResource;
            paperResource = statements.find(statement => statement.subject.id === id).subject;
            isPublished = true;
        } else {
            const { statements } = await getStatementsBundleBySubject({
                id
            });
            paperStatements = statements;
        }

        // get all published versions for this article
        const versions = await getVersions(paperResource.id);

        const contributionResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_CONTRIBUTION, id);

        if (contributionResources.length === 0) {
            console.log('no contributions found');
            notFound();
            return;
        }

        const contributionResource = contributionResources.find(statement => statement.classes.includes(CLASSES.CONTRIBUTION_SMART_REVIEW));

        if (!contributionResource) {
            console.log('no contribution with class "CONTRIBUTION_SMART_REVIEW" found');
            notFound();
            return;
        }

        // get the research field
        let researchField = null;
        const researchFieldStatement = paperStatements.find(
            statement => statement.subject.id === id && statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD
        );
        if (researchFieldStatement) {
            researchField = {
                id: researchFieldStatement.object.id,
                label: researchFieldStatement.object.label,
                statementId: researchFieldStatement.id
            };
        }

        const authorResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_AUTHOR, id);
        const sectionResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_SECTION, contributionResource.id);

        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
            sectionResources[index].statements = sectionStatements;
        }

        // add the orcid and statement id to the author statements
        for (const [index, author] of authorResources.entries()) {
            // orcid
            const orcidStatements = getStatementsBySubjectId(paperStatements, author.id);
            if (orcidStatements.length) {
                const orcidStatement = orcidStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
                const orcid = orcidStatement ? orcidStatement.object.label : '';
                authorResources[index].orcid = orcid;
            }

            // statementId
            const statementId = getStatementsByObjectId(paperStatements, author.id)[0]?.id;
            authorResources[index].statementId = statementId;
        }

        const sections = [];
        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
            sectionResources[index].statements = sectionStatements;
            const type = section.classes.length > 1 ? section.classes.find(_class => _class !== CLASSES.SECTION) : section.classes[0];
            let markdown = null;
            let contentLink = null;

            if ([CLASSES.RESOURCE_SECTION, CLASSES.PROPERTY_SECTION, CLASSES.COMPARISON_SECTION, CLASSES.VISUALIZATION_SECTION].includes(type)) {
                const linkStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_LINK);
                const link = linkStatement?.object;

                contentLink = {
                    id: section?.id,
                    objectId: link?.id,
                    label: link?.label
                };
            } else {
                const contentStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_CONTENT);
                const content = contentStatement?.object;
                markdown = {
                    id: content?.id,
                    label: content?.label
                };
            }

            sections.push({
                id: section.id,
                title: {
                    id: section.id,
                    label: section.label
                },
                type: {
                    id: type
                },
                markdown,
                contentLink
            });
        }

        // contributors
        const contributors = getAllContributors(paperStatements);

        return {
            paper: {
                id: paperResource.id,
                title: paperResource.label
            },
            contributionId: contributionResource.id,
            authorResources: authorResources.reverse(),
            sections: sections.reverse(),
            isPublished,
            versions,
            researchField,
            statements: paperStatements,
            contributors
        };
    }, []);

    const getAllContributors = statements => {
        if (statements.length === 0) {
            return [];
        }
        const contributors = statements
            .flatMap(statement => [statement.subject.created_by, statement.object.created_by, statement.created_by])
            .filter(contributor => contributor !== MISC.UNKNOWN_ID);

        const statementAmountPerContributor = countBy(contributors);
        const contributorsWithPercentage = Object.keys(statementAmountPerContributor).map(contributorId => ({
            id: contributorId,
            percentage: Math.round((statementAmountPerContributor[contributorId] / contributors.length) * 100)
        }));

        return orderBy(contributorsWithPercentage, 'percentage', 'desc');
    };

    const load = useCallback(
        async id => {
            setIsLoading(true);
            const article = await getArticleById(id);
            if (article) {
                dispatch(loadArticle(article));
            }
            setIsLoading(false);
        },
        [dispatch, getArticleById]
    );

    const getVersions = async paperId => {
        const statements = await getStatementsByObjectAndPredicate({ objectId: paperId, predicateId: PREDICATES.HAS_PAPER });
        const ids = statements.map(version => version.subject.id);

        if (ids.length === 0) {
            return [];
        }
        const versionsStatements = await getStatementsBySubjects({ ids });

        return versionsStatements
            .map(versionSubject => ({
                ...versionSubject.statements.find(
                    statement =>
                        statement.subject.classes.includes(CLASSES.SMART_REVIEW_PUBLISHED) && statement.predicate.id === PREDICATES.DESCRIPTION
                )
            }))
            .map(statement => ({
                id: statement.subject.id,
                date: statement.subject.created_at,
                description: statement.object.label,
                creator: statement.object.created_by
            }));
    };

    const notFound = () => {
        setIsNotFound(true);
        setIsLoading(false);
    };

    const getObjectsByPredicateAndSubject = (statements, predicateId, subjectId) => {
        return statements
            .filter(statement => statement.predicate.id === predicateId && statement.subject.id === subjectId)
            .map(statement => statement.object);
    };

    const getStatementsBySubjectId = (statements, subjectId) => {
        return statements.filter(statement => statement.subject.id === subjectId);
    };

    const getStatementsByObjectId = (statements, objectId) => {
        return statements.filter(statement => statement.object.id === objectId);
    };

    return { load, isLoading, isNotFound, getArticleById, getVersions };
};

export default useLoad;
