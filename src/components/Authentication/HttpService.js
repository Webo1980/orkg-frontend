import axios from 'axios';
import UserService from './UserService';

const _axios = axios.create();

const configure = () => {
    _axios.interceptors.request.use(config => {
        if (UserService.isLoggedIn()) {
            const cb = () => {
                config.headers.Authorization = `Bearer ${UserService.getToken()}`;
                return Promise.resolve(config);
            };
            return UserService.updateToken(cb);
        }
    });
};

const getAxiosClient = () => _axios;

const HttpService = {
    configure,
    getAxiosClient
};

export default HttpService;
