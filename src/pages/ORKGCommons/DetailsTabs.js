import { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import Datasets from './Datasets';
import Project from './Project';
import CitationsReferences from './CitationsReferences';
import { Col, Row } from 'reactstrap';
import { TabContent, TabPane, NavLink } from 'reactstrap';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

const FeaturedTabs = styled.div`
    .tab {
        margin-bottom: 0;
        padding: 15px;
        color: #4f4f4f;
        cursor: pointer;
        border-bottom: 2px solid ${props => props.theme.lightDarker};
        -webkit-transition: border 500ms ease-out;
        -moz-transition: border 500ms ease-out;
        -o-transition: border 500ms ease-out;
        transition: border 500ms ease-out;
        &.active,
        &:hover {
            border-bottom: 2px solid #e86161;
            color: white;
            background-color: #e86161;
        }
    }
`;

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const TabPaneStyled = styled(TabPane)`
    border-top: 0;
    display: block !important;
`;

export const StyledResearchFieldWrapper = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border: ${props => props.theme.borderWidth} solid ${props => props.theme.primary};
    padding: 15px 30px;
`;

export const StyledResearchFieldList = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;
`;

const StyledResearchFieldItem = styled(NavLink)`
    padding: 12px 10px 12px 15px;
    margin-bottom: 5px;
    transition: 0.3s background;
    border-top-left-radius: ${props => props.theme.borderRadius};
    border-bottom-left-radius: ${props => props.theme.borderRadius};
    border: 1px solid ${props => props.theme.lightDarker};
    background-color: ${props => props.theme.lightLighter};
    color: inherit;

    cursor: pointer !important;

    > span {
        cursor: pointer;
    }

    &.active {
        background: ${props => props.theme.primary};
        color: #fff;
        cursor: initial !important;
        border-color: ${props => props.theme.primary};
    }
`;

const DetailsTabs = ({ objectInformation }) => {
    const [activeTab, setActiveState] = useState(1);

    return (
        <Row noGutters={true}>
            <Col md={3} sm={12}>
                <StyledResearchFieldList>
                    <li key="dataset">
                        <StyledResearchFieldItem onClick={() => setActiveState(1)} className={activeTab === 1 ? 'active' : ''} href="#1">
                            Related Dataset
                        </StyledResearchFieldItem>
                    </li>

                    <li key="project">
                        <StyledResearchFieldItem onClick={() => setActiveState(2)} className={activeTab === 2 ? 'active' : ''} href="#2">
                            Project
                        </StyledResearchFieldItem>
                    </li>

                    <li key="citations">
                        <StyledResearchFieldItem onClick={() => setActiveState(3)} className={activeTab === 3 ? 'active' : ''} href="#3">
                            Citations
                        </StyledResearchFieldItem>
                    </li>

                    <li key="references">
                        <StyledResearchFieldItem onClick={() => setActiveState(4)} className={activeTab === 4 ? 'active' : ''} href="#4">
                            References
                        </StyledResearchFieldItem>
                    </li>
                </StyledResearchFieldList>
            </Col>

            <Col md={9} sm={12} className="d-flex">
                <StyledResearchFieldWrapper className="flex-grow-1 justify-content-center">
                    <TabContent activeTab={activeTab}>
                        {activeTab === 1 ? (
                            <TabPaneStyled key="dataset" tabId="1">
                                {console.log('9')}
                                <Row>
                                    <Datasets objectInformation={objectInformation.citations} />
                                </Row>
                            </TabPaneStyled>
                        ) : activeTab === 2 ? (
                            <TabPaneStyled key="dataset" tabId="2">
                                <Row>
                                    <Project objectInformation={objectInformation.project} />
                                </Row>
                            </TabPaneStyled>
                        ) : activeTab === 3 ? (
                            <TabPaneStyled key="dataset" tabId="3">
                                <Row>
                                    <CitationsReferences objectInformation={objectInformation.metadata.citations} />
                                </Row>
                            </TabPaneStyled>
                        ) : (
                            <TabPaneStyled key="dataset" tabId="4">
                                <Row>
                                    <CitationsReferences objectInformation={objectInformation.metadata.references} />
                                </Row>
                            </TabPaneStyled>
                        )}
                    </TabContent>
                </StyledResearchFieldWrapper>
            </Col>
        </Row>
        /*<div className="box rounded-lg mt-3">
            <FeaturedTabs className="clearfix d-flex">
                <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={e => e.keyCode === 13 && setActiveState(1)}
                    className={`h6 col-md-3 text-center tab ${activeTab === 1 ? 'active' : ''}`}
                    onClick={() => setActiveState(1)}
                >
                    {console.log(objectInformation)}
                    Related Dataset
                </div>
                <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={e => e.keyCode === 13 && setActiveState(2)}
                    className={`h6 col-md-3  ml-2 text-center tab ${activeTab === 2 ? 'active' : ''}`}
                    onClick={() => setActiveState(2)}
                >
                    Project
                </div>
                <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={e => e.keyCode === 13 && setActiveState(3)}
                    className={`h6 col-md-3 text-center tab ${activeTab === 3 ? 'active' : ''}`}
                    onClick={() => setActiveState(3)}
                >
                    Citations
                </div>
                <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={e => e.keyCode === 13 && setActiveState(4)}
                    className={`h6 col-md-3 text-center tab ${activeTab === 4 ? 'active' : ''}`}
                    onClick={() => setActiveState(4)}
                >
                    References
                </div>
            </FeaturedTabs>
            <TransitionGroup exit={false}>
                {activeTab === 1 ? (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div style={{ minHeight: '300px' }}>
                            <Datasets objectInformation={objectInformation.citations} />
                        </div>
                    </AnimationContainer>
                ) : activeTab === 2 ? (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div style={{ minHeight: '300px' }}>
                            <Project objectInformation={objectInformation.project} />
                        </div>
                    </AnimationContainer>
                ) : activeTab === 3 ? (
                    <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div style={{ minHeight: '300px' }}>
                            <CitationsReferences objectInformation={objectInformation.metadata.citations} />
                        </div>
                    </AnimationContainer>
                ) : (
                    <AnimationContainer key={4} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div style={{ minHeight: '300px' }}>
                            <CitationsReferences objectInformation={objectInformation.metadata.references} />
                        </div>
                    </AnimationContainer>
                )}
            </TransitionGroup>
        </div>*/
    );
};

DetailsTabs.propTypes = {
    objectInformation: PropTypes.object
};

export default DetailsTabs;
