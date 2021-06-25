import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPostRequest } from 'network';

export const notificationsUrl = `${url}notifications/`;
export const researchFieldsTreeUrl = `${url}researchfieldstree/`;
export const unsubscribeUrl = `${url}unsubscribe/`;

export const getNotificationsByUserId = userId => {
    return submitGetRequest(`${notificationsUrl}${encodeURIComponent(userId)}`);
};

export const deleteNotificationById = notificationId => {
    return submitDeleteRequest(`${notificationsUrl}${encodeURIComponent(notificationId)}`);
};

export const getNotificationByResourceAndUserId = (resourceId, userId) => {
    const getNotificationStatusUrl = notificationsUrl + 'resource/' + encodeURIComponent(resourceId) + '/user/' + encodeURIComponent(userId);
    return submitGetRequest(getNotificationStatusUrl);
};

export const subscribeToResource = notificationData => {
    console.log('Post:', notificationData);
    return submitPostRequest(notificationsUrl, { 'Content-Type': 'application/json' }, notificationData);
};

export const unsubscribeFromResource = notificationId => {
    return submitDeleteRequest(`${notificationsUrl}${notificationId}`);
};
/*
export const updateNotification = notificationData => {
    const updateUrl = notificationsUrl + 'update';
    console.log(updateUrl);
    return submitPostRequest(updateUrl, { 'Content-Type': 'application/json' }, notificationData);
};




export const getUnsubscribeByResourceAndUserId = (userId, resourceId) => {
    const getNotificationStatusUrl = unsubscribeUrl + 'user/' + encodeURIComponent(userId) + '/resource/' + encodeURIComponent(resourceId);
    return submitGetRequest(getNotificationStatusUrl);
};
*/
export const updateUnsubscribeStatusOfResource = notificationData => {
    return submitPostRequest(`${unsubscribeUrl}`, { 'Content-Type': 'application/json' }, notificationData);
};

/*export const deleteUnsubscribeStatusOfResource = (userId, resourceId) => {
    const getNotificationStatusUrl = unsubscribeUrl + 'user/' + encodeURIComponent(userId) + '/resource/' + encodeURIComponent(resourceId);
    return submitDeleteRequest(getNotificationStatusUrl);
};*/

export const updateResearchFieldNotifications = notificationData => {
    console.log('Post:', notificationData);
    console.log('testing update...');
    return submitPostRequest(researchFieldsTreeUrl, { 'Content-Type': 'application/json' }, notificationData);
};

export const getRFTreeForNotifications = userId => {
    const url = researchFieldsTreeUrl + 'userId/' + userId;
    return submitGetRequest(url);
};

export const getSubscriptionStatus = (userId, resourceId) => {
    const url = researchFieldsTreeUrl + 'userId/' + userId + '/resource/' + resourceId;
    return submitGetRequest(url);
};

export const deleteSubscriptionStatus = (userId, resourceId) => {
    const url = researchFieldsTreeUrl + 'userId/' + userId + '/resource/' + resourceId;
    const res = submitDeleteRequest(url);
    console.log(res);
    return res;
};

export const updateNotificationEmailSettings = notificationEmailData => {
    const url = notificationsUrl + 'email';
    console.log(url);
    console.log('Post:', notificationEmailData);
    return submitPostRequest(url, { ' Content-Type': 'application/json ' }, notificationEmailData);
};

export const getNotificationEmailSettings = userId => {
    const url = notificationsUrl + 'email/user/' + userId;
    return submitGetRequest(url);
};
