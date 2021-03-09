import { url } from 'constants/misc';
import { submitPostRequest, submitGetRequest } from 'network';
import queryString from 'query-string';

export const classesUrl = `${url}classes/`;

export interface Class {
    id: string;
    label: string;
    uri: string | null;
    created_at: string;
    created_by: string;
    _class: 'class';
}

export const getClassById = (id: string): Promise<Class[]> => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/`);

export const createClass = (label: string, uri: string | null = null): Promise<Class> =>
    submitPostRequest(classesUrl, { 'Content-Type': 'application/json' }, { label, uri });

export const getRDFDataCubeVocabularyClasses = (): Promise<Class[]> => submitGetRequest(`${classesUrl}?q=qb:`);

interface GetAllClasses {
    page: number;
    items: number;
    sortBy: string;
    desc: boolean;
    q: string | null;
}

export const getAllClasses = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }: GetAllClasses): Promise<Class[]> => {
    const params = queryString.stringify({ page, items, sortBy, desc, ...(q ? { q } : {}) });

    return submitGetRequest(`${classesUrl}?${params}`);
};

export const getClassOfTemplate = (templateId: string): Promise<Class[]> => submitGetRequest(`${classesUrl}?q=${templateId}&exact=true`);
