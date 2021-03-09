import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';

export const doisUrl = `${url}dois/`;

interface GetPaperByDOIResponse {
    id: string;
    doi: string;
    title: string;
    num_statements: number;
}

export const getPaperByDOI = (doi: string): Promise<GetPaperByDOIResponse> => {
    return submitGetRequest(`${url}widgets/?doi=${doi}`);
};

interface GenerateDOIForComparison {
    comparisonId: string;
    title: string;
    subject: string;
    description: string;
    relatedResources: string[];
    authors: { creator: string; orcid: string }[];
    url: string;
}

interface GenerateDOIForComparisonResponse {
    data: {
        attributes: {
            doi: string;
        };
    };
}

export const generateDOIForComparison = ({
    comparisonId,
    title,
    subject,
    description,
    relatedResources,
    authors,
    url
}: GenerateDOIForComparison): Promise<GenerateDOIForComparisonResponse> => {
    return submitPostRequest(
        doisUrl,
        { 'Content-Type': 'application/json' },
        { comparisonId, title, subject, description, relatedResources, authors, url }
    );
};
