import { deleteStatementsByIds, createResourceStatement, getTemplatesByClass, getStatementsBySubject } from 'services/backend/statements';
import { getClassOfTemplate } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createClass } from 'services/backend/classes';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { createResource, updateResource } from 'services/backend/resources';
import { toast } from 'react-toastify';

export const saveTemplate = async diagram => {
    // get nodes
    //console.log(diagram.getModel().getNodes());

    for (const node of diagram.getModel().getNodes()) {
        //console.log(node.ports);

        if (!node.label) {
            // Make the template label mandatory
            toast.error('Please enter the name of template');
            return null;
        }
        if (node.targetClass && node.targetClass.id) {
            //  Check if the template of the class if already defined
            const templates = await getTemplatesByClass(node.targetClass.id);
            if (templates.length > 0 && !templates.includes(node.id)) {
                toast.error('The template of this class is already defined');
                return null;
            }
        }

        const promises = [];
        let templateResource;
        if (!node.id) {
            templateResource = await createResource(node.label, [CLASSES.CONTRIBUTION_TEMPLATE]);
            templateResource = templateResource.id;
        } else {
            templateResource = node.id;
            await updateResource(templateResource, node.label);
        }

        // delete all the statement
        if (node.id) {
            const statements = await getStatementsBySubject({ id: node.id });
            await deleteStatementsByIds(statements.map(s => s.id));
        }

        if (node.closed) {
            // set the statement that says this is strict template
            const strictLiteral = await createLiteral('True');
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_STRICT, strictLiteral.id));
        }

        // save template class
        if (node.targetClass && node.targetClass.id) {
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, node.targetClass.id));
        } else {
            // Generate class for the template
            let templateClass = await getClassOfTemplate(templateResource);
            if (templateClass && templateClass.length === 1) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, templateClass[0].id));
            } else {
                templateClass = await createClass(templateResource);
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, templateClass.id));
            }
        }

        // We use reverse() to create statements to keep the order of elements inside the input field
        // save template predicate
        if (node.predicate && node.predicate.id) {
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_PREDICATE, node.predicate.id));
        }

        // save template research fields
        if (node.researchFields && node.researchFields.length > 0) {
            for (const researchField of node.researchFields.reverse()) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD, researchField.id));
            }
        }
        // save template research problems
        if (node.researchProblems && node.researchProblems.length > 0) {
            for (const researchProblem of node.researchProblems.reverse()) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM, researchProblem.id));
            }
        }

        let index = 0;
        for (const propertyId of Object.keys(node.ports)) {
            const propertyNode = node.ports[propertyId];
            //console.log(port);
            if (!propertyNode.input) {
                const portConfiguration = propertyNode.configurations;
                const component = await createResource(`Component for template ${templateResource}`);
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_COMPONENT, component.id));
                promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_PROPERTY, portConfiguration.property.id));
                if (portConfiguration.valueType && portConfiguration.valueType.id) {
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_VALUE, portConfiguration.valueType.id));
                }
                // save Minimum Occurrence
                if (portConfiguration.minOccurs || portConfiguration.minOccurs === 0) {
                    const minimumLiteral = await createLiteral(portConfiguration.minOccurs);
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MIN, minimumLiteral.id));
                }
                // save Maximum Occurrence
                if (portConfiguration.maxOccurs || portConfiguration.maxOccurs === 0) {
                    const maximumLiteral = await createLiteral(portConfiguration.maxOccurs);
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MAX, maximumLiteral.id));
                }
                // save Order
                const orderLiteral = await createLiteral(index);
                promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_ORDER, orderLiteral.id));
                // save validation rules
                if (
                    portConfiguration.valueType &&
                    ['Number', 'String'].includes(portConfiguration.valueType.id) &&
                    portConfiguration.validationRules
                ) {
                    for (const key in portConfiguration.validationRules) {
                        if (portConfiguration.validationRules.hasOwnProperty(key)) {
                            if (portConfiguration.validationRules[key]) {
                                const ruleLiteral = await createLiteral(`${key}#${portConfiguration.validationRules[key]}`);
                                promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_VALIDATION_RULE, ruleLiteral.id));
                            }
                        }
                    }
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_VALUE, portConfiguration.valueType.id));
                }
                index = index + 1;
            }
        }

        //save Label Format
        if (node.hasLabelFormat && node.labelFormat) {
            const labelFormatLiteral = await createLiteral(node.labelFormat);
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_LABEL_FORMAT, labelFormatLiteral.id));
        }
    }
    // get links
    //console.log(diagram.getModel().getLinks());
    return Promise.resolve();
};
