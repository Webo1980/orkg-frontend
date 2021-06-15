import { useState, useEffect, useCallback } from 'react';
import { getDatasetBenchmarksByDatasetId } from 'services/backend/datasets';
import { groupBy, sortBy } from 'lodash';

// Loading summary for a dataset
function useBenchmarkDatasetPapers({ datasetId }) {
    const [benchmarkDatasetPapers, setBenchmarkDatasetPapers] = useState({});
    const [metrics, setMetrics] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailedLoadingPapers, setIsFailedLoadingPapers] = useState(false);

    const loadBenchmarkDatasetPapers = useCallback(() => {
        setIsLoading(true);
        setIsFailedLoadingPapers(false);
        return getDatasetBenchmarksByDatasetId(datasetId)
            .then(result => {
                // TODO: this trim needs to be done on the data itself
                let trimResult = result.map(s => {
                    s.metric = s.metric.trim();
                    return s;
                });
                trimResult = sortBy(trimResult, ['paper_year', 'paper_month']);
                setBenchmarkDatasetPapers(groupBy(trimResult, 'metric'));
                setMetrics(Object.keys(groupBy(trimResult, 'metric')));
                setSelectedMetric(Object.keys(groupBy(trimResult, 'metric'))[0]);
                setIsLoading(false);
                setIsFailedLoadingPapers(false);
            })
            .catch(() => {
                setMetrics([]);
                setBenchmarkDatasetPapers({});
                setIsLoading(false);
                setIsFailedLoadingPapers(true);
            });
    }, [datasetId]);

    useEffect(() => {
        if (datasetId) {
            loadBenchmarkDatasetPapers(datasetId);
        }
    }, [datasetId, loadBenchmarkDatasetPapers]);

    return {
        benchmarkDatasetPapers,
        metrics,
        selectedMetric,
        isLoading,
        isFailedLoadingPapers,
        setSelectedMetric
    };
}

export default useBenchmarkDatasetPapers;
