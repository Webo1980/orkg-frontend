import React, { Component } from 'react';
import { Col } from 'reactstrap';
import { StyledAltmetricsBox } from './styled';
import { ImpactViz } from './ROSI/js/impact';
import PropTypes from 'prop-types';
import { AltmetricsBoxStyled } from './ROSI/style/style';

class AltmetricsBox extends Component {
    componentDidMount() {
        /*
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://d3js.org/d3.v4.min.js';
        //For head
        document.head.appendChild(script);
        */
        const identifier = this.props.doi;
        const impact = new ImpactViz(identifier);
        impact.initViz();
    }

    componentDidUpdate = prevProps => {
        if (this.props.doi !== prevProps.doi) {
            const identifier = this.props.doi;
            const impact = new ImpactViz(identifier);
            impact.initViz();
        }
    };

    scriptLoaded = () => {
        window.A.sort();
    };

    render() {
        return (
            <Col>
                <StyledAltmetricsBox className="mt-2 pt-md-4 pb-md-4 pl-md-5 pr-md-5 pt-sm-2 pb-sm-2 pl-sm-2 pr-sm-2 clearfix">
                    <h5>Scientometric indicators </h5>
                    <AltmetricsBoxStyled>
                        <div id="impactviz-overview" />
                        <div id="impactviz-details" />
                    </AltmetricsBoxStyled>
                </StyledAltmetricsBox>
            </Col>
        );
    }
}

AltmetricsBox.propTypes = {
    doi: PropTypes.string.isRequired
};

export default AltmetricsBox;
