import Joi from 'joi';

export default function validationSchema(component) {
    let schema;
    if (component.value) {
        switch (component.value.id) {
            case 'Date':
                schema = Joi.date().iso();
                break;
            case 'Number':
                schema = Joi.number();
                break;
            case 'String':
                schema = Joi.string();
                break;
            case 'Integer':
                schema = Joi.number().integer();
                break;
            case 'Boolean':
                schema = Joi.boolean();
                break;
            case 'URI':
                schema = Joi.string().uri();
                break;
            default:
                break;
        }
        for (const key in component.validationRules) {
            if (component.validationRules.hasOwnProperty(key)) {
                switch (key) {
                    case 'min':
                        schema = schema.min(parseFloat(component.validationRules[key]));
                        break;
                    case 'max':
                        schema = schema.max(parseFloat(component.validationRules[key]));
                        break;
                    case 'pattern':
                        schema = schema.regex(new RegExp(component.validationRules[key]));
                        break;
                    default:
                        break;
                }
            }
        }
    }
    return schema.label(component.property.label);
}
