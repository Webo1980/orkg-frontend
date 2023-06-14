import PropTypes from 'prop-types';
import styled from 'styled-components';

const LineContainer = styled.div`
    width: 5px;
    margin: 0 0 0 15px;
    position: relative;
    height: 100%;
`;

const HorizontalLine = styled.div`
    border-top: 1px dotted ${props => props.color};
    width: 5px;
    height: 1px;
    position: absolute;
    top: 50%;
    left: 1px;
`;

const VerticalLine = styled.div`
    border-right: 1px dotted ${props => props.color};
    width: 1px;
    height: 100%;
`;

const HierarchyIndicator = ({ path = [], color = '#000' }) =>
    path?.slice(1).map((_path, index) => (
        <LineContainer key={index}>
            <VerticalLine color={color} />
            {index === path.slice(1).length - 1 && <HorizontalLine color={color} />}
        </LineContainer>
    ));

HierarchyIndicator.propTypes = {
    path: PropTypes.array,
    color: PropTypes.string,
};

export default HierarchyIndicator;
