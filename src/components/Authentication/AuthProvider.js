import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { firstLoad } from 'actions/auth';
import UserService from 'userService';

const AuthProvider = ({ children }) => {
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        UserService.initKeycloak(() => {
            dispatch(firstLoad())
                .then(() => {
                    setIsLoadingUser(false);
                })
                .catch(() => {
                    setIsLoadingUser(false);
                });
        });
    }, [dispatch]);

    if (isLoadingUser) {
        return <Container>Loading....</Container>;
    }

    return children;
};

export default AuthProvider;
