import Joi from 'joi';
import { MISC } from 'constants/graphSettings';
//https://www.w3.org/TR/xmlschema-2/#boolean

const DATA_TYPES = [
    { type: MISC.DEFAULT_LITERAL_DATATYPE, schema: Joi.string(), inputFormType: 'textarea' },
    { type: 'xsd:decimal', schema: Joi.number(), inputFormType: 'text' },
    { type: 'xs:integer', schema: Joi.number().integer(), inputFormType: 'text' },
    { type: 'xs:boolean', schema: Joi.boolean(), inputFormType: 'boolean' },
    { type: 'xsd:date', schema: Joi.date(), inputFormType: 'date' }
];

export const getConfigByType = type => {
    return DATA_TYPES.find(dt => dt.type === type) || { type: MISC.DEFAULT_LITERAL_DATATYPE, validation: Joi.string(), inputFormType: 'textarea' };
};
export default DATA_TYPES;
