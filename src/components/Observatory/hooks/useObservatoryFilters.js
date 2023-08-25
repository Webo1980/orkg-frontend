import { useCallback, useEffect, useState } from 'react';
import { getFiltersByObservatoryId } from 'services/backend/observatories';

const useObservatoryFilters = ({ id }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState([]);

    const loadObservatoryFilters = useCallback(oId => {
        if (oId) {
            setIsLoading(true);
            // Get the observatory filters
            getFiltersByObservatoryId({ id: oId })
                .then(result => {
                    setFilters(result.content);
                    setIsLoading(false);
                })
                .catch(() => {
                    setFilters([]);
                    setIsLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (id !== undefined) {
            loadObservatoryFilters(id);
        }
    }, [id, loadObservatoryFilters]);

    const refreshFilter = () => {
        loadObservatoryFilters(id);
    };

    return { isLoading, filters, refreshFilter, setFilters };
};

export default useObservatoryFilters;
