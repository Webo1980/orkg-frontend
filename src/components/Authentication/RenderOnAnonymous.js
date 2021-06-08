import UserService from './UserService';

const RenderOnAnonymous = ({ children }) => (!UserService.isLoggedIn() ? children : null);

export default RenderOnAnonymous;
