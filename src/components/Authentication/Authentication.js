import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, toggleAuthDialog } from '../../actions/auth';
import KeycloakSignIn from './KeycloakSignIn';

class Authentication extends Component {
    render() {
        return <KeycloakSignIn />;
    }
}

const mapStateToProps = state => ({
    dialogIsOpen: state.auth.dialogIsOpen,
    action: state.auth.action
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload)),
    toggleAuthDialog: () => dispatch(toggleAuthDialog())
});

Authentication.propTypes = {
    action: PropTypes.string.isRequired,
    dialogIsOpen: PropTypes.bool.isRequired,
    toggleAuthDialog: PropTypes.func.isRequired,
    openAuthDialog: PropTypes.func.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Authentication);
