import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import ResearchFieldCards from './ResearchFieldCards';
import RecentlyAddedPapers from './RecentlyAddedPapers';
import FeaturedPapers from './FeaturedPapers';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

class Home extends Component {
    componentDidMount = () => {
        document.title = 'Open Research Knowledge Graph';
    };

    componentDidUpdate() {
        const showSignOutMessage = this.props.location.state && this.props.location.state.signedOut;

        if (showSignOutMessage) {
            let locationState = { ...this.props.location.state, signedOut: false };
            this.props.history.replace({ state: locationState });
            toast.success('You have been signed out successfully');
        }
    }

    render = () => {
        return (
            <div>
                <Container className="mt-4">
                    <Row>
                        <Col className="col-sm-7 px-0">
                            <FeaturedPapers />
                        </Col>
                    </Row>
                </Container>

                <Container className="mt-4">
                    <Row>
                        <Col className="col-sm-7 px-0">
                            <div className="box mr-4 p-4 h-100">
                                <h2 className="h5">
                                    <Icon icon={faStar} className="text-primary" /> Browse by research field
                                </h2>
                                <ResearchFieldCards />
                            </div>
                        </Col>
                        <Col className="col-sm-5 px-0">
                            <div className="box p-4 h-100">
                                <h2 className="h5">
                                    <Icon icon={faPlus} className="text-primary" /> Recently added papers
                                </h2>
                                <RecentlyAddedPapers />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    };
}

Home.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default Home;
