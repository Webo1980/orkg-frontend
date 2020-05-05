import { connect } from 'react-redux';
import {
    togglePropertyCollapse,
    toggleEditPropertyLabel,
    changeProperty,
    isSavingProperty,
    doneSavingProperty,
    deleteProperty,
    getComponentsByResourceIDAndPredicate
} from 'actions/statementBrowser';
import StatementItem from './StatementItem';

const mapStateToProps = (state, props) => {
    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        resources: state.statementBrowser.resources,
        templates: state.statementBrowser.templates,
        classes: state.statementBrowser.classes,
        components: getComponentsByResourceIDAndPredicate(
            state,
            props.resourceId ? props.resourceId : props.selectedResource,
            props.property.existingPredicateId
        )
    };
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: id => dispatch(deleteProperty(id)),
    togglePropertyCollapse: id => dispatch(togglePropertyCollapse(id)),
    toggleEditPropertyLabel: data => dispatch(toggleEditPropertyLabel(data)),
    changeProperty: data => dispatch(changeProperty(data)),
    isSavingProperty: data => dispatch(isSavingProperty(data)),
    doneSavingProperty: data => dispatch(doneSavingProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementItem);
