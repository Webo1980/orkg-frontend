import UserService from 'userService';

const RenderOnAuthenticated = ({ children }) => (UserService.isLoggedIn() ? children : null);

export default RenderOnAuthenticated;
