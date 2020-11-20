import React from 'react';
import { FormGroup, Label, Col, Input } from 'reactstrap';
import { Fieldset } from 'components/TemplateEditor/styled';
import PropTypes from 'prop-types';

function StringTypeRulesForm(props) {
    const min = props.validationRules && props.validationRules['min'] ? props.validationRules['min'] : '';
    const max = props.validationRules && props.validationRules['max'] ? props.validationRules['max'] : '';

    return (
        <Fieldset className="border pl-4 pr-4 pt-2 pb-2">
            <legend className="w-auto pl-1 pr-1">
                <small>Number Validation</small>
            </legend>
            <div className="mt-2">
                <FormGroup row>
                    <Label className="text-right text-muted" for="minimumValueInput" sm={3}>
                        <small>Minimum value</small>
                    </Label>
                    <Col sm={9}>
                        <Input
                            bsSize="sm"
                            type="text"
                            value={min}
                            name="min"
                            id="minimumValueInput"
                            placeholder="Specify the minimum value"
                            onChange={event => props.onChange({ max: max, [event.target.name]: event.target.value })}
                        />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label className="text-right text-muted" for="maximumValueInput" sm={3}>
                        <small>Maximum value</small>
                    </Label>
                    <Col sm={9}>
                        <Input
                            bsSize="sm"
                            value={max}
                            type="text"
                            name="max"
                            id="maximumValueInput"
                            placeholder="Specify the maximum value"
                            onChange={event => props.onChange({ min: min, [event.target.name]: event.target.value })}
                        />
                    </Col>
                </FormGroup>
            </div>
        </Fieldset>
    );
}

StringTypeRulesForm.propTypes = {
    validationRules: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    model: PropTypes.object
};

export default StringTypeRulesForm;
