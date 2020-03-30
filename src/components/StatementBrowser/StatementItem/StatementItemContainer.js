import { connect } from 'react-redux';
import {
    togglePropertyCollapse,
    toggleEditPropertyLabel,
    changeProperty,
    isSavingProperty,
    doneSavingProperty,
    deleteProperty,
    createValue
} from 'actions/statementBrowser';
import { toggleSelectedDndValues } from 'actions/addPaper';
import StatementItem from './StatementItem';

const mapStateToProps = state => {
    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        dndSelectedValues: state.addPaper.dndSelectedValues
    };
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: id => dispatch(deleteProperty(id)),
    togglePropertyCollapse: id => dispatch(togglePropertyCollapse(id)),
    toggleEditPropertyLabel: data => dispatch(toggleEditPropertyLabel(data)),
    changeProperty: data => dispatch(changeProperty(data)),
    isSavingProperty: data => dispatch(isSavingProperty(data)),
    doneSavingProperty: data => dispatch(doneSavingProperty(data)),
    toggleSelectedDndValues: data => dispatch(toggleSelectedDndValues(data)),
    createValue: data => dispatch(createValue(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementItem);
