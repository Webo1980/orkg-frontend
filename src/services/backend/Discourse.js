import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';

export const discussionsUrl = `${url}discussions/`;

export const createDiscourseTopic = (title, raw) => {
    return submitPostRequest(discussionsUrl, { 'Content-Type': 'application/json' }, { title, raw });
};

export const getDiscourseDiscussion = async slug => {
    return submitGetRequest(`${discussionsUrl}${encodeURIComponent(slug)}/discussion`);
};
