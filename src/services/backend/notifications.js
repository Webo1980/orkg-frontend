import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPostRequest } from 'network';

export const notificationsUrl = `${url}notifications/`;
export const researchFieldsTreeUrl = `${url}researchfieldstree/`;

export const getNotificationsByUserId = userId => {
    return submitGetRequest(`${notificationsUrl}${encodeURIComponent(userId)}`);
};

export const deleteNotificationById = notificationId => {
    return submitDeleteRequest(`${notificationsUrl}${encodeURIComponent(notificationId)}`);
};

export const updateNotification = notificationData => {
    const updateUrl = notificationsUrl + 'update';
    console.log(updateUrl);
    return submitPostRequest(updateUrl, { 'Content-Type': 'application/json' }, notificationData);
};

export const subscribeToResource = notificationData => {
    console.log('Post:', notificationData);
    return submitPostRequest(notificationsUrl, { 'Content-Type': 'application/json' }, notificationData);
};

export const unsubscribeFromResource = notificationId => {
    return submitDeleteRequest(`${notificationsUrl}${notificationId}`);
};

export const getNotificationByResourceAndUserId = (resourceId, userId) => {
    const getNotificationStatusUrl = notificationsUrl + 'resource/' + encodeURIComponent(resourceId) + '/user/' + encodeURIComponent(userId);
    return submitGetRequest(getNotificationStatusUrl);
};

export const updateResearchFieldNotifications = notificationResearchFields => {
    console.log('Post:', notificationResearchFields);
    return submitPostRequest(researchFieldsTreeUrl, { 'Content-Type': 'application/json' }, notificationResearchFields);
};

export const getRFTreeForNotifications = userId => {
    const url = researchFieldsTreeUrl + 'userId/' + userId;
    return submitGetRequest(url);
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
