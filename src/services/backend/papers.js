import { url } from 'constants/misc';
import { submitPutRequest, submitDeleteRequest, submitPostRequest, submitGetRequest } from 'network';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import { indexContribution } from 'services/similarity';
import UserService from '../../components/Authentication/UserService';

export const papersUrl = `${url}papers/`;

// Save full paper and index contributions in the similarity service
export const saveFullPaper = (data, mergeIfExists = false) => {
    const token = UserService.getToken();
    return submitPostRequest(
        `${papersUrl}?mergeIfExists=${mergeIfExists}`,
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        data
    ).then(paper => {
        indexContributionsByPaperId(paper.id);
        return paper;
    });
};

export const getDetails = () => {
    const token = UserService.getToken();
    return submitGetRequest(`${papersUrl}test`, { 'Content-Type': 'application/json' });
};

export const getIsVerified = id => {
    return submitGetRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });
};

export const markAsVerified = id => {
    const token = UserService.getToken();
    return submitPutRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
};

export const markAsUnverified = id => {
    const token = UserService.getToken();
    return submitDeleteRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
};

export const indexContributionsByPaperId = async paperId => {
    const contributionStatements = await getStatementsBySubjectAndPredicate({
        subjectId: paperId,
        predicateId: PREDICATES.HAS_CONTRIBUTION
    });

    return contributionStatements.map(statement => indexContribution(statement.object.id));
};
