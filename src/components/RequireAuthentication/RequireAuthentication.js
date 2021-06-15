import UserService from 'userService';
import PropTypes from 'prop-types';

const RequireAuthentication = ({ component: Component, ...rest }) => {
    const requireAuthentication = e => {
        if (!UserService.isLoggedIn()) {
            UserService.doLogin();
            // Don't follow the link when user is not authenticated
            e.preventDefault();
            return null;
        }
        if (rest.onClick) {
            rest.onClick(e);
        }
    };

    return <Component {...rest} onClick={requireAuthentication} />;
};

RequireAuthentication.propTypes = {
    component: PropTypes.elementType.isRequired,
    onClick: PropTypes.func
};

export default RequireAuthentication;
