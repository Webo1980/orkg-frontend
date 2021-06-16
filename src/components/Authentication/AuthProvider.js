import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { firstLoad } from 'actions/auth';

import UserService from 'userService';

const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        UserService.initKeycloak(() => {
            dispatch(firstLoad());
        });
    }, [dispatch]);

    return children;
};

export default AuthProvider;
