import { Button } from 'reactstrap';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, resetAuth, toggleAuthDialog, updateAuth } from 'actions/auth';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import RenderOnAnonymous from './RenderOnAnonymous';
import UserService from 'userService';

class KeycloakSignIn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            loading: false,
            errors: null,
            keycloak: null,
            authenticated: false
        };
    }

    componentDidMount() {
        if (UserService.isLoggedIn) {
            const keycloakInstance = UserService.getKeycloakInstance();
            if (keycloakInstance.idTokenParsed) {
                this.signInRequired = false;
                this.props
                    .updateAuth({
                        user: {
                            displayName: keycloakInstance.idTokenParsed.name,
                            id: keycloakInstance.idTokenParsed.sub,
                            token: keycloakInstance.idToken,
                            tokenExpire: keycloakInstance.tokenParsed.exp,
                            isCurationAllwed: 'true'
                        }
                    })
                    .catch(error => {
                        this.props.resetAuth();
                        this.signInRequired = true;
                    });
            }
        }
    }

    componentDidUpdate() {
        if (UserService.isLoggedIn) {
            const keycloakInstance = UserService.getKeycloakInstance();
            console.log(keycloakInstance);
            if (keycloakInstance.idTokenParsed) {
                this.props.updateAuth({
                    user: {
                        displayName: keycloakInstance.idTokenParsed.name,
                        id: keycloakInstance.idTokenParsed.sub,
                        token: keycloakInstance.idToken,
                        tokenExpire: keycloakInstance.tokenParsed.exp,
                        email: keycloakInstance.idTokenParsed.email,
                        isCurationAllwed: 'true'
                    }
                });
                this.signInRequired = false;
            }
        }
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <div>
                <RenderOnAnonymous>
                    <Button color="primary" className="mt-2 mb-2" onClick={() => UserService.doLogin()}>
                        Sign In
                    </Button>
                </RenderOnAnonymous>
            </div>
        );
    }
}

KeycloakSignIn.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    updateAuth: PropTypes.func.isRequired,
    toggleAuthDialog: PropTypes.func.isRequired,
    signInRequired: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    redirectRoute: PropTypes.string,
    resetAuth: PropTypes.func.isRequired
};

KeycloakSignIn.defaultProps = {
    redirectRoute: null
};

const mapStateToProps = state => ({
    signInRequired: state.auth.signInRequired,
    redirectRoute: state.auth.redirectRoute
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload)),
    updateAuth: data => dispatch(updateAuth(data)),
    toggleAuthDialog: () => dispatch(toggleAuthDialog()),
    resetAuth: () => dispatch(resetAuth())
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withRouter
)(KeycloakSignIn);
