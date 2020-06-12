import React, { Component } from 'react';
import AddProperty from 'components/StatementBrowser/AddProperty/AddPropertyContainer';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItemContainer';
import ContributionTemplate from 'components/StatementBrowser/ContributionTemplate/ContributionTemplateContainer';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { canAddProperty } from 'actions/statementBrowser';
import { compose } from 'redux';
import { withCookies, Cookies } from 'react-cookie';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class TemplateWizard extends Component {
    render() {
        const propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.initialResourceId
                ? this.props.resources.byId[this.props.initialResourceId].propertyIds
                : [];
        const shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.initialResourceId
                ? this.props.resources.byId[this.props.initialResourceId].shared
                : 1;
        return (
            <div className={'contributionData'}>
                {propertyIds.length > 0 ? (
                    propertyIds.map((propertyId, index) => {
                        const property = this.props.properties.byId[propertyId];
                        if (!property.isTemplate) {
                            return (
                                <StatementItem
                                    key={'statement-' + index}
                                    id={propertyId}
                                    property={property}
                                    predicateLabel={property.label}
                                    enableEdit={shared <= 1 ? this.props.enableEdit : false}
                                    syncBackend={this.props.syncBackend}
                                    isLastItem={propertyIds.length === index + 1}
                                    showValueHelp={this.props.cookies && !this.props.cookies.get('showedValueHelp') && index === 0 ? true : false}
                                    resourceId={this.props.initialResourceId}
                                    contextStyle={'Template'}
                                />
                            );
                        } else {
                            const valueIds =
                                Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[propertyId].valueIds : [];
                            return valueIds.map((valueId, index) => {
                                const value = this.props.values.byId[valueId];
                                return (
                                    <ContributionTemplate
                                        key={`template-${index}-${valueId}`}
                                        id={valueId}
                                        value={value}
                                        propertyId={propertyId}
                                        selectedResource={this.props.initialResourceId}
                                        enableEdit={this.props.enableEdit}
                                        syncBackend={this.props.syncBackend}
                                        isAnimated={property.isAnimated}
                                    />
                                );
                            });
                        }
                    })
                ) : (
                    <NoData enableEdit={this.props.enableEdit} templatesFound={this.props.templatesFound} />
                )}

                {this.props.canAddProperty && (
                    <AddProperty
                        isDisabled={!this.props.canAddProperty}
                        contextStyle="Template"
                        syncBackend={false}
                        resourceId={this.props.initialResourceId}
                    />
                )}
            </div>
        );
    }
}

TemplateWizard.propTypes = {
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    initialResourceId: PropTypes.string,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    templatesFound: PropTypes.bool,
    canAddProperty: PropTypes.bool,
    cookies: PropTypes.instanceOf(Cookies).isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties,
        canAddProperty: canAddProperty(state, ownProps.initialResourceId)
    };
};

export default compose(
    connect(mapStateToProps),
    withCookies
)(TemplateWizard);
