import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { getNotificationsByUserId, deleteNotificationById } from 'services/backend/notifications';
import { toast } from 'react-toastify';

const NotificationDetails = () => {
    const user = useSelector(state => state.auth.user);

    const mapResourceType = {};
    mapResourceType[0] = 'Paper';
    mapResourceType[1] = 'Comparison';
    mapResourceType[2] = 'Visualization';
    mapResourceType[3] = 'Research Field';

    console.log(user);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(true);
    const [notificationList, setNotificationList] = useState([]);

    const deleteNotification = notificationId => {
        const response = deleteNotificationById(notificationId);
        const newNotificationList = notificationList.filter(notification => {
            return notification.id !== notificationId;
        });
        setNotificationList(newNotificationList);
    };

    useEffect(() => {
        setIsLoading(true);
        getNotificationsByUserId(user.id)
            .then(notifications => {
                console.log(notificationList);
                setNotificationList(notifications);
                setIsLoading(false);
            })
            .catch(e => {
                setIsLoading(false);
                toast.error('Failed to load notifications data');
            });
    }, []);

    return (
        <div>
            {notificationList.length === 0 && <span>There are no notifications.</span>}
            <ul>
                {notificationList.length > 0 &&
                    notificationList.map(notification => (
                        <li>
                            <Alert key={notification.id} className="m-1 p-1" show={show}>
                                <div>
                                    <span>
                                        <Link
                                            to={reverse(ROUTES.VIEW_PAPER, {
                                                resourceId: notification.resourceId,
                                                contributionId: notification.notificationByUserId
                                            })}
                                        >
                                            {notification.newPaper && <span>A paper with the title - {notification.title} was added</span>}
                                            {!notification.newPaper && <span>A paper with the title - {notification.title} was modified</span>}
                                        </Link>
                                    </span>
                                    <Button className="ml-4" onClick={() => deleteNotification(notification.id)} variant="outline-danger">
                                        Delete
                                    </Button>
                                </div>
                            </Alert>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default NotificationDetails;
