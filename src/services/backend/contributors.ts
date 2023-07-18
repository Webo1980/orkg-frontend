import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const contributorsUrl = `${url}contributors/`;
export const authenticationUrl = env('BACKEND_URL');

export type Contributor = {
    id: string;
    display_name: string;
    joined_at: string;
    organization_id: string;
    observatory_id: string;
    gravatar_id: string;
    avatar_url: string;
};

export const getContributorInformationById = (contributorsId: string): Promise<Contributor> =>
    submitGetRequest(`${contributorsUrl}${contributorsId}`, {}, true);
