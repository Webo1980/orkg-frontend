import React, { Component } from 'react';
import { createResourceStatement, createResource, createLiteral, createLiteralStatement, createPredicate } from 'network';
import AddValueTemplate from './AddValueTemplate';
import { guid } from 'utils';
import PropTypes from 'prop-types';
import { MISC } from 'constants/graphSettings';

export default class AddValue extends Component {
    /**
     * Create statements for a resource starting from an array of statements
     *
     * @param {Array} data array of statement
     * @return {Object} object of statements to use as an entry for prefillStatements action
     */
    generateStatementsFromExternalData = data => {
        const statements = { properties: [], values: [] };
        const createdProperties = {};
        for (const statement of data) {
            const propertyID = guid();
            if (!createdProperties[statement.predicate.id]) {
                createdProperties[statement.predicate.id] = propertyID;
                statements['properties'].push({
                    propertyId: createdProperties[statement.predicate.id],
                    existingPredicateId: statement.predicate.id,
                    label: statement.predicate.label
                });
            }
            statements['values'].push({
                type: 'literal',
                propertyId: createdProperties[statement.predicate.id],
                label: statement.value.label
            });
        }
        return statements;
    };

    handleValueSelect = async (valueType, { id, value, shared, classes, external, statements }) => {
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            if (external) {
                // create the object
                const newObject = await createResource(value, this.props.valueClass ? [this.props.valueClass.id] : []);
                const newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                this.props.createValue({
                    label: value,
                    type: valueType,
                    propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                    existingResourceId: newObject.id,
                    isExistingValue: true,
                    statementId: newStatement.id,
                    shared: newObject.shared,
                    classes: this.props.valueClass ? [this.props.valueClass.id] : []
                });
                //create statements
                this.props.prefillStatements({
                    statements: this.generateStatementsFromExternalData(statements),
                    resourceId: newObject.id,
                    syncBackend: this.props.syncBackend
                });
            } else {
                const newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, id);
                this.props.createValue({
                    label: value,
                    type: valueType,
                    propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                    classes: classes,
                    existingResourceId: id,
                    isExistingValue: true,
                    statementId: newStatement.id,
                    shared: shared
                });
            }
        } else {
            if (external) {
                const newObject = await this.handleAddValue(valueType, value, null);
                // create statements
                this.props.prefillStatements({
                    statements: this.generateStatementsFromExternalData(statements),
                    resourceId: newObject,
                    syncBackend: this.props.syncBackend
                });
            } else {
                this.props.createValue({
                    label: value,
                    type: valueType,
                    propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                    classes: classes,
                    existingResourceId: id,
                    isExistingValue: true,
                    shared: shared
                });
            }
        }
    };

    handleAddValue = async (valueType, inputValue, datatype = MISC.DEFAULT_LITERAL_DATATYPE) => {
        let newObject = null;
        let newStatement = null;
        const valueId = guid();
        const existingResourceId = guid();
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];
            switch (valueType) {
                case 'object':
                    newObject = await createResource(inputValue, this.props.valueClass ? [this.props.valueClass.id] : []);
                    newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                case 'property':
                    newObject = await createPredicate(inputValue);
                    newStatement = await createResourceStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                default:
                    newObject = await createLiteral(inputValue, datatype);
                    newStatement = await createLiteralStatement(this.props.selectedResource, predicate.existingPredicateId, newObject.id);
            }
            this.props.createValue({
                label: inputValue,
                type: valueType,
                ...(valueType === 'literal' && { datatype: datatype }),
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                existingResourceId: newObject.id,
                isExistingValue: true,
                statementId: newStatement.id,
                shared: newObject.shared,
                classes: this.props.valueClass ? [this.props.valueClass.id] : []
            });
        } else {
            this.props.createValue({
                valueId,
                label: inputValue,
                type: valueType,
                ...(valueType === 'literal' && { datatype: datatype }),
                propertyId: this.props.propertyId ? this.props.propertyId : this.props.selectedProperty,
                existingResourceId,
                isExistingValue: false,
                classes: this.props.valueClass ? [this.props.valueClass.id] : [],
                shared: 1
            });
        }
        return newObject ? newObject.id : existingResourceId;
    };

    render() {
        const predicate = this.props.properties.byId[this.props.propertyId ? this.props.propertyId : this.props.selectedProperty];

        return (
            <>
                <AddValueTemplate
                    predicate={predicate}
                    properties={this.props.properties}
                    propertyId={this.props.propertyId}
                    selectedProperty={this.props.selectedProperty}
                    handleValueSelect={this.handleValueSelect}
                    handleInputChange={this.handleInputChange}
                    newResources={this.props.newResources}
                    handleAddValue={this.handleAddValue}
                    fetchTemplatesofClassIfNeeded={this.props.fetchTemplatesofClassIfNeeded}
                    components={this.props.components}
                    classes={this.props.classes}
                    templates={this.props.templates}
                    selectResource={this.props.selectResource}
                    openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                    isDisabled={this.props.isDisabled}
                    createRequiredPropertiesInResource={this.props.createRequiredPropertiesInResource}
                    isLiteral={this.props.isLiteral}
                    valueClass={this.props.valueClass}
                />
            </>
        );
    }
}

AddValue.propTypes = {
    createValue: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    propertyId: PropTypes.string,
    selectedResource: PropTypes.string.isRequired,
    newResources: PropTypes.array.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    properties: PropTypes.object.isRequired,
    contextStyle: PropTypes.string.isRequired,
    createProperty: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    selectResource: PropTypes.func.isRequired,
    fetchTemplatesofClassIfNeeded: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    createRequiredPropertiesInResource: PropTypes.func.isRequired,
    isLiteral: PropTypes.bool.isRequired,
    valueClass: PropTypes.object
};

AddValue.defaultProps = {
    contextStyle: 'StatementBrowser',
    isDisabled: false
};
