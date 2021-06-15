import UserService from 'userService';

const RenderOnAnonymous = ({ children }) => (!UserService.isLoggedIn() ? children : null);

export default RenderOnAnonymous;
