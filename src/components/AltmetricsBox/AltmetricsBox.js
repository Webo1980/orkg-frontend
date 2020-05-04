import React from 'react';
import { Col } from 'reactstrap';
import { StyledAltmetricsBox } from './styled';

export default function AltmetricsBox() {
    return (
        <Col>
            <StyledAltmetricsBox className="mt-2 pt-md-4 pb-md-4 pl-md-5 pr-md-5 pt-sm-2 pb-sm-2 pl-sm-2 pr-sm-2 clearfix">
                Altmetrics paper impact indicators Box
            </StyledAltmetricsBox>
        </Col>
    );
}
