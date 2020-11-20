import React from 'react';
import { FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import { Fieldset } from 'components/TemplateEditor/styled';
import PropTypes from 'prop-types';

function StringTypeRulesForm(props) {
    return (
        <Fieldset className="border pl-4 pr-4 pt-2 pb-2">
            <legend className="w-auto pl-1 pr-1">
                <small>String Validation</small>
            </legend>
            <div className="mt-2">
                <FormGroup row>
                    <Label className="text-right text-muted" for="patternInput" sm={3}>
                        <small>Pattern</small>
                    </Label>
                    <Col sm={9}>
                        <Input
                            bsSize="sm"
                            type="text"
                            name="pattern"
                            id="patternInput"
                            value={props.validationRules && props.validationRules['pattern'] ? props.validationRules['pattern'] : ''}
                            placeholder="Enter a regular expression"
                            onChange={event => props.onChange({ [event.target.name]: event.target.value })}
                        />
                        <FormText>It must begin with ^ and end with $.</FormText>
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
