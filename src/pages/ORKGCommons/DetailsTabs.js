import { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import Datasets from './Datasets';

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
        color: #bebbac;
        cursor: pointer;
        border-bottom: 2px solid ${props => props.theme.lightDarker};
        -webkit-transition: border 500ms ease-out;
        -moz-transition: border 500ms ease-out;
        -o-transition: border 500ms ease-out;
        transition: border 500ms ease-out;
        &.active,
        &:hover {
            border-bottom: 2px solid #e86161;
            color: #646464;
            background-color: grey;
        }
    }
`;

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const DetailsTabs = ({ objectInformation }) => {
    const [activeTab, setActiveState] = useState(2);

    return (
        <SidebarStyledBox className="box rounded-lg mt-3">
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
                    className={`h6 col-md-3 text-center tab ${activeTab === 2 ? 'active' : ''}`}
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
                        {/* <Datasets objectInformation={objectInformation.citations} /> */}
                        <div style={{ minHeight: '300px' }}>
                            <Datasets objectInformation={objectInformation.citations} />
                        </div>
                    </AnimationContainer>
                ) : (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div> 2 </div>
                    </AnimationContainer>
                )}
            </TransitionGroup>
        </SidebarStyledBox>
    );
};

DetailsTabs.propTypes = {
    objectInformation: PropTypes.object
};

export default DetailsTabs;
