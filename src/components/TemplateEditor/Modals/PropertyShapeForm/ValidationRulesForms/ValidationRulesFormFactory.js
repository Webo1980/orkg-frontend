import React from 'react';
import StringTypeRulesForm from './StringTypeRulesForm';
import NumberTypeRulesForm from './NumberTypeRulesForm';
import PropTypes from 'prop-types';

const ValidationRulesFormFactory = props => {
    if (props.valueType) {
        switch (props.valueType.id) {
            case 'String':
                return <StringTypeRulesForm {...props} />;
            case 'Number':
                return <NumberTypeRulesForm {...props} />;
            default:
                return null;
        }
    } else {
        return null;
    }
};

ValidationRulesFormFactory.propTypes = {
    valueType: PropTypes.object,
    validationRules: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    model: PropTypes.object
};

export default ValidationRulesFormFactory;
