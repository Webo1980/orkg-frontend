import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faConnectdevelop } from '@fortawesome/free-brands-svg-icons';
import FeaturesBg from 'assets/img/features-bg.png';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const JumbotronStyled = styled.div`
    padding: 100px 0;
    color: hsla(0, 0%, 100%, 0.6);
    background: ${props => props.theme.darkblueDarker} url(${FeaturesBg});
    background-position-x: 0%, 0%;
    background-position-y: 0%, 0%;
    background-size: auto, auto;
    background-position: center 10%;
    background-size: cover;
    position: relative;

    .marketingtext {
        font-size: larger;
    }

    .jumbotron-video-open {
        cursor: pointer;
    }

    .jumbotron-video-close {
        position: absolute;
        top: 0;
        right: -40px;
        font-size: 30px;
    }

    .video-responsive {
        position: relative;
        max-width: 100%;
        height: 0;
        padding-bottom: 56.25%;
    }
    .js-video-iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

const FeaturesWrapper = styled.div`
    background: #fff;
    padding: 10px 0;
    .text-gray {
        color: ${props => props.theme.darkblueDarker};
    }

    .feature-box {
        margin: 30px 0 60px;
    }
    .marketingtext {
        font-size: 16px;
    }
`;

export default class Features extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVideoOpen: false
        };
    }

    toggle = () => {
        this.setState({
            isVideoOpen: !this.state.isVideoOpen
        });
    };

    render() {
        return (
            <div>
                <JumbotronStyled className="pt-6 pb-6">
                    <Container className="position-relative text-center">
                        <h1 className="mb-3 text-white">Scholarly Knowledge. Structured</h1>
                        <div className="col-md-8 mx-auto mb-5 marketingtext">
                            <p className="mr-n2 ml-n2">The Open Research Knowledge Graph aims to describe research papers in a structured manner.</p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            {!this.state.isVideoOpen ? (
                                <p className="mt-4 mb-4 text-shadow-dark text-center">
                                    <span className="text-white jumbotron-video-open" onClick={this.toggle}>
                                        <Icon icon={faPlayCircle} className={'mr-2'} />
                                        See the demonstration of the research comparison functionality
                                    </span>
                                </p>
                            ) : (
                                <div>
                                    <div className="video-responsive">
                                        <iframe
                                            className="js-video-iframe"
                                            src="https://www.youtube.com/embed/mbe-cVyW_us?rel=0"
                                            frameborder="0"
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen={true}
                                            title="Open Research Knowledge Graph (ORKG) - Paper comparison demo"
                                        />
                                    </div>
                                    <span className="jumbotron-video-close">
                                        <span span className="text-white" onClick={this.toggle}>
                                            <Icon icon={faTimes} />
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </Container>
                </JumbotronStyled>
                <FeaturesWrapper>
                    <Container>
                        <div className={'feature-box'}>
                            <h4 className="h4 text-gray text-center">Open-Source project</h4>
                            <h2 className="mt-3 mb-2 text-center">Micro Services Architecture</h2>
                            <p className="marketingtext text-center mb-4 col-md-8 mx-auto text-gray">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                type specimen book.
                            </p>
                            <p className="text-center mb-4">
                                <a href="https://doi.org/10.1145/3360901.3364435" target="_blank" rel="noopener noreferrer">
                                    Learn about ORKG Infrastructure<span class="Bump-link-symbol">→</span>
                                </a>
                            </p>
                        </div>
                        <div className="feature-box d-md-flex text-md-center">
                            <div className="col-md-4 px-md-3 mb-5">
                                <Icon className="mb-3" icon={faConnectdevelop} size="6x" color={'#333'} />
                                <h4 className="mb-1">Automatic annotations</h4>
                                <p className="mb-4 text-gray">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                    type specimen book.
                                </p>
                            </div>
                            <div className="col-md-4 px-md-3 mb-5">
                                <Icon className="mb-3" icon={faConnectdevelop} size="6x" color={'#333'} />
                                <h4 className="mb-1">Crowd-Sourced Content</h4>
                                <p className="mb-4 text-gray">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                    type specimen book.
                                </p>
                            </div>
                            <div className="col-md-4 px-md-3 mb-5">
                                <Icon className="mb-3" icon={faConnectdevelop} size="6x" color={'#333'} />
                                <h4 className="mb-1">Faceted Search</h4>
                                <p className="mb-4 text-gray">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                    type specimen book.
                                </p>
                            </div>
                        </div>

                        <div className="feature-box d-flex flex-column flex-md-row align-items-center">
                            <div className="col-md-6 text-center mb-4">
                                <img
                                    src={require('assets/img/graphvis.png')}
                                    alt="Graph Visualisation"
                                    className="d-block img-responsive width-fit mx-auto"
                                />
                            </div>
                            <div className="col-md-6 pr-md-5">
                                <h4 className="mb-1">Graph Visualisation</h4>
                                <p className="mb-3 mr-3 text-gray">
                                    Advanced graph-based visualization of papers in the form of node-link diagrams. ORKG visualization facilitate the
                                    browsing and the exploration of scholarly communications.
                                </p>
                            </div>
                        </div>
                        <div className="feature-box d-flex flex-column flex-md-row align-items-center">
                            <div className="col-md-6 pr-md-5">
                                <h4 className="mb-1">Tabular views</h4>
                                <p className="mb-3 mr-3 text-gray">
                                    ORKG supports <a href="https://www.w3.org/TR/vocab-data-cube/">RDF Data Cube Vocabulary</a> via UI widget that
                                    automatically shows data as tables.
                                </p>
                            </div>
                            <div className="col-md-6 text-center mb-4">
                                <img
                                    src={require('assets/img/tabular.png')}
                                    alt="Tabular views"
                                    className="d-block img-responsive width-fit mx-auto"
                                />
                            </div>
                        </div>
                        <div className="feature-box d-flex flex-column flex-md-row align-items-center">
                            <div className="col-md-6 text-center mb-4">
                                <img src={require('assets/img/logo.svg')} alt="project" className="d-block img-responsive width-fit mx-auto" />
                            </div>
                            <div className="col-md-6 pr-md-5">
                                <h4 className="mb-1">Similar contributions</h4>
                                <p className="mb-3 mr-3 text-gray">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                    type specimen book.
                                </p>
                            </div>
                        </div>
                        <div className="feature-box d-flex flex-column flex-md-row align-items-center">
                            <div className="col-md-6 pr-md-5">
                                <h4 className="mb-1">Contributions comparisons</h4>
                                <p className="mb-3 mr-3 text-gray">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                    type specimen book.
                                </p>
                            </div>
                            <div className="col-md-6 text-center mb-4">
                                <img src={require('assets/img/logo.svg')} alt="project" className="d-block img-responsive width-fit mx-auto" />
                            </div>
                        </div>
                        <div className="feature-box d-flex flex-column flex-md-row align-items-center">
                            <div className="col-md-6 text-center mb-4">
                                <img
                                    src={require('assets/img/rdf.png')}
                                    alt="RDF export and triple store"
                                    className="d-block img-responsive width-fit mx-auto"
                                />
                            </div>
                            <div className="col-md-6 pr-md-5">
                                <h4 className="mb-1">RDF export and triple store</h4>
                                <p className="mb-3 mr-3 text-gray">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
                                    type specimen book.
                                </p>
                            </div>
                        </div>
                    </Container>
                </FeaturesWrapper>
                <div>
                    <Container className="pt-4 pb-4 pl-4 pr-4 d-flex mt-5">
                        <div className="flex-grow-1">
                            <h1 style={{ fontSize: '2rem' }}>Open Research Knowledge Graph</h1>
                            <div className="mt-4 mr-4">
                                <p className="mb-0">
                                    The ORKG aims to describe research papers and contributions in a structured manner. With the ORKG research
                                    contributions become findable and comparable. Click the button on the right to learn more.
                                </p>
                            </div>
                        </div>
                        <div className="about-link flex-shrink-0 justify-content-center d-flex align-items-center">
                            <a
                                href="https://projects.tib.eu/orkg/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-darkblue btn-lg btn-block btn-default"
                                style={{ width: 200 }}
                            >
                                Learn More
                            </a>
                        </div>
                    </Container>
                </div>
            </div>
        );
    }
}
