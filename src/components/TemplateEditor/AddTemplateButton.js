import React from 'react';
import env from '@beam-australia/react-env';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { FloatButton, FloatButtonIcon } from 'pages/AddPaper';

const AddTemplateButton = ({ handleClick, isOpen }) => (
    <div>
        <FloatButton id="addTemplateButton" onClick={handleClick} woochat={env('CHATWOOT_WEBSITE_TOKEN')}>
            <FloatButtonIcon icon={faPlus} />
        </FloatButton>
    </div>
);

AddTemplateButton.propTypes = {
    handleClick: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default AddTemplateButton;
