import { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Container, Row, Col, Alert, Button } from 'reactstrap';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import FeaturedItemsBox from 'components/Home/FeaturedItemsBox';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import ContributorsBox from 'components/TopContributors/ContributorsBox';
import useResearchFieldSelector from 'components/Home/hooks/useResearchFieldSelector';
import { MISC } from 'constants/graphSettings';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { getSubscriptionStatus, updateResearchFieldNotifications, deleteSubscriptionStatus } from 'services/backend/notifications';
import { useSelector } from 'react-redux';

export default function Home() {
    const location = useLocation();
    const history = useHistory();
    const { selectedResearchField, handleFieldSelect, researchFields, isLoadingFields } = useResearchFieldSelector({
        id: MISC.RESEARCH_FIELD_MAIN,
        label: 'Main'
    });
    const [subscribeStatus, setSubscribeStatus] = useState(true);
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        document.title = 'Open Research Knowledge Graph';
        console.log('user =>', user);
        console.log(selectedResearchField);
        getResourceNotificationStatus(selectedResearchField);
    }, [selectedResearchField]);

    const showSignOutMessage = location.state && location.state.signedOut;

    if (showSignOutMessage) {
        const locationState = { ...location.state, signedOut: false };
        history.replace({ state: locationState });
        toast.success('You have been signed out successfully');
    }

    const getResourceNotificationStatus = resourceId => {
        console.log('user:', user);
        if (user.id !== null && user.id !== undefined) {
            const userId = user.id;
            if (userId) {
                //getNotificationByResourceAndUserId(userId, resourceId)
                getSubscriptionStatus(userId, resourceId.id)
                    .then(data => {
                        console.log('Status:', data);
                        setSubscribeStatus(data);
                    })
                    .catch(error => {
                        toast.error('Error while loading notification data');
                    });
            }
        }
    };

    const toggleSubscriptionInformation = () => {
        const userId = user.id;
        const resourceId = selectedResearchField.id;
        console.log(userId, resourceId);

        const notificationData = {
            userId,
            resourceId
        };

        console.log(subscribeStatus);
        if (subscribeStatus) {
            deleteSubscriptionStatus(userId, resourceId);
        } else {
            updateResearchFieldNotifications(notificationData);
        }

        setSubscribeStatus(!subscribeStatus);
    };

    return (
        <Container style={{ marginTop: -70 }}>
            {moment() < moment('2021-06-01T00:00:00') && (
                <Alert color="info" className="box mt-2">
                    The ORKG <strong>Curation Grant Competition</strong> has launched. Apply until 31st of May 2021.{' '}
                    <Link to={ROUTES.CURATION_CALL}>Find out more</Link>
                </Alert>
            )}
            {moment() < moment('2021-05-13T00:00:00') && (
                <Alert color="info" className="box mt-2">
                    <strong>Webinar:</strong> Open Research Knowledge Graph - 11th May 2021, 14:00 - 15:00 (CEST).{' '}
                    <Link to={ROUTES.WEBINAR_MAY_11}>More information</Link>
                </Alert>
            )}
            <Row>
                <Col md="12">
                    <div className="box rounded-lg p-3">
                        <ResearchFieldCards
                            selectedResearchField={selectedResearchField}
                            handleFieldSelect={handleFieldSelect}
                            researchFields={researchFields}
                            isLoading={isLoadingFields}
                        />
                    </div>
                </Col>
            </Row>
            {selectedResearchField.id !== MISC.RESEARCH_FIELD_MAIN && (
                <div className="h4 mt-4 mb-2 pl-3">
                    {selectedResearchField.label}
                    {!subscribeStatus && <Button onClick={toggleSubscriptionInformation}>Follow</Button>}
                    {subscribeStatus && <Button onClick={toggleSubscriptionInformation}>UnFollow</Button>}
                </div>
            )}
            <Row>
                <Col md="8">
                    <div className="mt-3 mt-md-0 d-flex flex-column">
                        <FeaturedItemsBox researchFieldId={selectedResearchField.id} />
                    </div>
                </Col>
                <Col md="4">
                    <div className="mt-3 box rounded d-flex flex-column overflow-hidden">
                        <Benefits />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ObservatoriesBox researchFieldId={selectedResearchField.id} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ContributorsBox researchFieldId={selectedResearchField.id} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <LastUpdatesBox researchFieldId={selectedResearchField.id} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
