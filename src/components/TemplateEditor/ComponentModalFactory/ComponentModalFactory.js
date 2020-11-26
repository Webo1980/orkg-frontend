import React from 'react';
import PropertyShapeForm from 'components/TemplateEditor/Modals/PropertyShapeForm/PropertyShapeForm';
import FormattedLabelForm from 'components/TemplateEditor/Modals/FormattedLabelForm/FormattedLabelForm';
import NodeShapeForm from 'components/TemplateEditor/Modals/NodeShapeForm/NodeShapeForm';
import PortModel from 'components/TemplateEditor/core/Port/PortModel';
import PropTypes from 'prop-types';

const ComponentModalFactory = props => {
    if (props.model instanceof PortModel) {
        return <PropertyShapeForm {...props} />;
    } else {
        if (props.action === 'addPort') {
            return <PropertyShapeForm {...props} />;
        } else if (props.action === 'formattedLabel') {
            return <FormattedLabelForm {...props} />;
        } else {
            //Add template
            return <NodeShapeForm {...props} />;
        }
    }
};

ComponentModalFactory.propTypes = {
    handleComponentDrop: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    model: PropTypes.object,
    action: PropTypes.string
};

export default ComponentModalFactory;
