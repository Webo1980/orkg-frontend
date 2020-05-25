import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { uniq } from 'lodash';
import { getResource } from 'network';
import { connect } from 'react-redux';
import { fetchStatementsForResource, createResource } from 'actions/statementBrowser';
import { getValueClass, isInlineResource } from 'components/StatementBrowser/AddValue/helpers/utils';
import format from 'string-format';

class FormatedLabel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            label: renderToString(this.props.children),
            isLoading: true,
            classes: [],
            labelFormat: ''
        };
    }

    componentDidMount = () => {
        if (this.props.showFormatedLabel) {
            getResource(this.props.resourceId).then(responseJson => {
                if (responseJson.classes) {
                    this.setState({ classes: responseJson.classes });
                    if (responseJson.classes) {
                        this.props.createResource({
                            resourceId: this.props.resourceId,
                            label: this.state.label,
                            existingResourceId: this.props.resourceId
                        });
                        this.props.fetchStatementsForResource({
                            resourceId: this.props.resourceId,
                            existingResourceId: this.props.resourceId
                        });
                    }
                }
            });
        }
    };

    componentDidUpdate = (prevProps, prevState) => {
        const resource = this.props.resources.byId[this.props.resourceId];
        const prevResource = prevProps.resources.byId[this.props.resourceId];
        if (prevResource && resource) {
            if (resource && resource.isFetching !== prevResource.isFetching && !resource.isFetching) {
                this.setState({ isLoading: false });
            }
        }
    };

    generatdFormatedlabel = labelFormat => {
        const resource = this.props.resources.byId[this.props.resourceId];
        const valueObject = {};
        if (resource && resource.propertyIds && labelFormat) {
            for (const propertyId of resource.propertyIds) {
                const property = this.props.properties.byId[propertyId];
                valueObject[property.existingPredicateId] =
                    property.valueIds && property.valueIds.length > 0 ? this.props.values.byId[property.valueIds[0]].label : '';
            }
            if (Object.keys(valueObject).length > 0) {
                return format(labelFormat, valueObject);
            } else {
                return this.state.label;
            }
        } else {
            return this.state.label;
        }
    };

    getLabel = () => {
        if (this.state.classes) {
            // get all template ids
            let templateIds = [];
            for (const c of this.state.classes) {
                if (this.props.classes[c]) {
                    templateIds = templateIds.concat(this.props.classes[c].templateIds);
                }
            }
            templateIds = uniq(templateIds);
            // check if it formated label
            let hasLabelFormat = false;
            let labelFormat = '';
            for (const templateId of templateIds) {
                const template = this.props.templates[templateId];
                if (template && template.hasLabelFormat) {
                    hasLabelFormat = true;
                    labelFormat = template.labelFormat;
                }
            }
            if (!hasLabelFormat) {
                return this.state.label;
            }
            return this.generatdFormatedlabel(labelFormat);
        } else {
            return this.state.label;
        }
    };

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }
        if (this.props.showFormatedLabel) {
            if (!this.state.isLoading) {
                return <div>{this.getLabel() || ''}</div>;
            } else {
                return 'Loading...';
            }
        } else {
            return label;
        }
    }
}

FormatedLabel.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
    resourceId: PropTypes.string,
    showFormatedLabel: PropTypes.bool,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    fetchStatementsForResource: PropTypes.func.isRequired,
    createResource: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties,
        classes: state.statementBrowser.classes,
        templates: state.statementBrowser.templates
    };
};

const mapDispatchToProps = dispatch => ({
    createResource: data => dispatch(createResource(data)),
    fetchStatementsForResource: data => dispatch(fetchStatementsForResource(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FormatedLabel);
