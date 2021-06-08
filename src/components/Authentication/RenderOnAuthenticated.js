import UserService from './UserService';

const RenderOnAuthenticated = ({ children }) => (UserService.isLoggedIn() ? children : null);

export default RenderOnAuthenticated;
