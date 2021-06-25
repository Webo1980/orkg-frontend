import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { getNotificationsByUserId, deleteNotificationById } from 'services/backend/notifications';
import { toast } from 'react-toastify';
import Dotdotdot from 'react-dotdotdot';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFile, faCubes } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import Gravatar from 'react-gravatar';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.secondary};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primaryColor};
    }
`;

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
                console.log('list:', notifications);
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

            {notificationList.length > 0 &&
                notificationList.map(notification => (
                    <Alert key={notification.id} className="m-1 p-1" show={show}>
                        <div className="row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <div className="column" style={{ flexBasis: '90%' }}>
                                <Link
                                    to={reverse(ROUTES.VIEW_PAPER, {
                                        resourceId: notification.resourceId,
                                        contributionId: notification.notificationByUserId
                                    })}
                                >
                                    {notification.newPaper && <span>A paper with the title - {notification.title} was added</span>}
                                    {!notification.newPaper && <span>A paper with the title - {notification.title} was modified</span>}
                                </Link>
                            </div>
                            <div className="column" style={{ flexBasis: '10%' }}>
                                <Tippy key={`contributor${notification.profile.gravatar_id}`} content={notification.profile.display_name}>
                                    <Link className="ml-1" to={reverse(ROUTES.USER_PROFILE, { userId: notification.profile.id })}>
                                        <StyledGravatar className="rounded-circle" md5={notification.profile.gravatar_id} size={24} />
                                    </Link>
                                </Tippy>
                            </div>
                        </div>
                    </Alert>
                ))}
        </div>
    );
};

export default NotificationDetails;
