/**
 * Services file for CMS service
 */
import env from '@beam-australia/react-env';
import { submitGetRequest } from 'network';

export const url = env('CMS_URL');

export const getPageByUrl = _url => submitGetRequest(`${url}pages?filters[url]=${_url}`);

export const getAboutPage = id =>
    submitGetRequest(`${url}about-pages/${id}?populate[category][fields][0]=id&populate[createdBy][fields][0]=username`);

export const getAboutPageVersions = versionId =>
    submitGetRequest(`${url}about-pages?filters[vuid]=${versionId}&publicationState=preview&sort=id:desc&populate[createdBy][fields][0]=username`);

export const getAboutPagesMenu = (categoryId = null) =>
    submitGetRequest(
        `${url}about-pages?fields[0]=title&populate[category][fields][0]=label,order&populate[category][sort][0]=order${
            categoryId ? `&filters[category][id][$eq]=${categoryId}` : ''
        }`,
    ).catch(() => []);

export const getHelpArticle = id =>
    submitGetRequest(`${url}help-articles/${id}?populate[help_category][fields][0]=id,title&populate[createdBy][fields][0]=username`);

export const getHelpArticleVersions = versionId =>
    submitGetRequest(`${url}help-articles?filters[vuid]=${versionId}&publicationState=preview&sort=id:desc&populate[createdBy][fields][0]=username`);

export const getHelpArticles = ({ where = '' }) => submitGetRequest(`${url}help-articles?${where}`);

export const getHelpCategories = () =>
    submitGetRequest(`${url}help-categories?sort=order&populate[help_articles][fields][0]=title,order&populate[help_articles][sort][0]=order`);

export const getHelpCategory = id => submitGetRequest(`${url}help-categories/${id}?fields[0]=title`);

export const getHelpCategoryArticles = id => submitGetRequest(`${url}help-articles?filters[help_category][id][$eq]=${id}&fields[0]=title&sort=order`);

export const getHomeAlerts = () => submitGetRequest(`${url}home-alerts?sort=order`).catch(() => []);

export const getNewsCards = ({ limit = 10, sort = 'created_at' }) =>
    submitGetRequest(`${url}news-cards?pagination[pageSize]=${limit}&sort=${sort}`).catch(() => []);
