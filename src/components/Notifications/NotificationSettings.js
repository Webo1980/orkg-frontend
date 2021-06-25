import React, { useState, useEffect } from 'react';
import { Container, Row, TabContent, TabPane } from 'reactstrap';
import styled from 'styled-components';
import classnames from 'classnames';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import Widget from './Widget';
import { useSelector } from 'react-redux';
import NotificationDetails from './NotificationDetails';
import MailSettings from './MailSettings';
import ResearchFieldSubscriptions from './ResearchFieldSubscriptions';

export const StyledSettingsMenu = styled.div`
    list-style: none;
    padding: 0;
    padding-top: 15px;

    > div {
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-radius: ${props => props.theme.borderRadius};
        cursor: pointer;

        &.active,
        &:hover {
            background: ${props => props.theme.primary};
            color: #fff;
        }
        &.active a {
            color: #fff;
        }
    }
`;
const NotificationSettings = () => {
    const [activeTab, setActiveTab] = useState('notifications');
    const user = useSelector(state => state.auth.user);
    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (
        <>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Notification Settings</h1>
            </Container>
            <Container className="p-0">
                <Row>
                    <div className="col-3 justify-content-center">
                        <Container className="box rounded p-3">
                            <StyledSettingsMenu>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleTab('notifications')}
                                    className={classnames({
                                        active: activeTab === 'notifications'
                                    })}
                                    onKeyDown={e => (e.keyCode === 13 ? toggleTab('general') : undefined)}
                                >
                                    Notifications
                                </div>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleTab('general')}
                                    className={classnames({
                                        active: activeTab === 'general'
                                    })}
                                    onKeyDown={e => (e.keyCode === 13 ? toggleTab('general') : undefined)}
                                >
                                    General settings
                                </div>

                                <div
                                    className={classnames({ active: activeTab === 'mail' })}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleTab('mail')}
                                    onKeyDown={e => (e.keyCode === 13 ? toggleTab('mail') : undefined)}
                                >
                                    <div>Mail Settings</div>
                                </div>
                            </StyledSettingsMenu>
                        </Container>
                    </div>
                    <div className="col-9 justify-content-center">
                        <TabContent className="box rounded pt-4 pb-3 pl-5 pr-5" activeTab={activeTab}>
                            <TabPane tabId="notifications">
                                <NotificationDetails />
                            </TabPane>
                            <TabPane tabId="general">
                                {/*<Widget user={user} />*/}
                                <ResearchFieldSubscriptions />
                            </TabPane>
                            <TabPane tabId="mail">
                                <MailSettings />
                            </TabPane>
                        </TabContent>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default NotificationSettings;
