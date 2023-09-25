import usePathname from 'components/NextJsMigration/usePathname';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const isInTest = typeof global.it === 'function';
export const LOCATION_CHANGE = !isInTest ? 'resetStoreOnNavigate/LOCATION_CHANGE' : 'NoReset';

const ResetStoreOnNavigate = ({ children }) => {
    const pathname = usePathname();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({
            type: LOCATION_CHANGE,
            payload: { location: { pathname } },
        });
    }, [dispatch, pathname]);

    return children;
};

export default ResetStoreOnNavigate;
