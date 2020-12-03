import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'reactstrap';
import styled from 'styled-components';

const ComponentButton = styled(Button)`
    width: calc(50% - 14px);
    margin: 7px;
    min-height: 70px;
    padding: 5px !important;
    &.btn-darkblue {
        border: 1px solid #4c536a !important;
    }
    &.btn-light {
        border: 1px solid #b1b7ce !important;
        background: #f2f4f8;
    }
    position: relative;
`;

const ComponentHelp = styled.a`
    position: absolute;
    right: 4px;
    top: 0px;
    font-size: 90%;
`;

const PipelineComponent = ({ active, handleClick, desc, url, name }) => (
    <ComponentButton color={active ? 'darkblue' : 'light'} onClick={handleClick}>
        <Tippy content={desc}>
            <ComponentHelp href={url} target="_blank" rel="noopener noreferrer" className={active ? 'text-light' : 'text-darkblue'}>
                <Icon icon={faQuestionCircle} />
            </ComponentHelp>
        </Tippy>
        {name}
    </ComponentButton>
);

PipelineComponent.propTypes = {
    desc: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
    url: PropTypes.string,
    name: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired
};

PipelineComponent.defaultProps = {
    url: undefined
};

export default PipelineComponent;
