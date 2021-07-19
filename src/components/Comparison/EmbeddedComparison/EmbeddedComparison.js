import { useEffect } from 'react';
import Comparison from 'components/Comparison/Comparison';
import useComparison from 'components/Comparison/hooks/useComparison';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const EmbeddedComparison = props => {
    const {} = useComparison({
        id: props.id
    });

    const contributions = useSelector(state => state.comparison.contributions);
    const data = useSelector(state => state.comparison.data);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);

    useEffect(() => {
        if (!isLoadingResult) {
            props.updateReferences(contributions);
            props.setComparisonDataCallBack(data);
        }
    }, [contributions, data, isLoadingResult, props]);
    return (
        <>
            {props.id && !isLoadingResult && contributions.length > 0 && <Comparison transpose={false} viewDensity="compact" embeddedMode={true} />}
            {props.id && isLoadingResult && <ComparisonLoadingComponent />}
        </>
    );
};

EmbeddedComparison.propTypes = {
    id: PropTypes.string,
    updateReferences: PropTypes.func,
    setComparisonDataCallBack: PropTypes.func
};

export default EmbeddedComparison;
