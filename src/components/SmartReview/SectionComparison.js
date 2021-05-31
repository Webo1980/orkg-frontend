import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import Comparison from 'components/Comparison/Comparison';
import useComparison from 'components/Comparison/hooks/useComparison';
import PropTypes from 'prop-types';
import React from 'react';

const SectionComparison = ({ id }) => {
    const { contributions, properties, data, isLoadingComparisonResult, filterControlData, updateRulesOfProperty, comparisonType } = useComparison({
        id
    });

    return (
        <>
            {id && contributions.length > 0 && (
                <Comparison
                    data={data}
                    properties={properties}
                    contributions={contributions}
                    removeContribution={() => {}}
                    transpose={false}
                    viewDensity="compact"
                    comparisonType={comparisonType}
                    filterControlData={filterControlData}
                    updateRulesOfProperty={updateRulesOfProperty}
                    embeddedMode={true}
                />
            )}
            {id && isLoadingComparisonResult && <ComparisonLoadingComponent />}
        </>
    );
};

SectionComparison.propTypes = {
    id: PropTypes.string.isRequired
};

export default SectionComparison;
