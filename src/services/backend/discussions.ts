import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';
import { PaginatedResponse, Predicate } from 'services/backend/types';

export const discussionsUrl = `${url}discussions/topic/`;

export const getDiscussionsByEntityId = ({
    entityId,
    page,
    size = 5,
}: {
    entityId: string;
    page: number;
    size?: number;
}): Promise<PaginatedResponse<Predicate>> => {
    const params: string = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${discussionsUrl}${entityId}?${params}`);
};

export const getDiscussionCountByEntityId = async (entityId: string) => {
    const params: string = qs.stringify(
        { page: 0, size: 1 },
        {
            skipNulls: true,
        },
    );

    return (await submitGetRequest(`${discussionsUrl}${entityId}?${params}`)).totalElements;
};

export const createComment = ({ entityId, message }: { entityId: string; message: string }) =>
    submitPostRequest(`${discussionsUrl}${entityId}`, { 'Content-Type': 'application/json' }, { message });

export const deleteComment = ({ entityId, commentId }: { entityId: string; commentId: string }) =>
    submitDeleteRequest(`${discussionsUrl}${entityId}/${commentId}`);
