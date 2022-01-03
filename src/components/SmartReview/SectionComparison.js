import { setComparisonData } from 'actions/smartReview';
import Comparison from 'components/Comparison/Comparison';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import useComparison from 'components/Comparison/hooks/useComparison';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUsedReferences } from 'actions/smartReview';
import { isEqual } from 'lodash';

const SectionComparison = ({ id, sectionId }) => {
    const references = useSelector(state => state.smartReview.references);
    const usedReferences = useSelector(state => state.smartReview.usedReferences);
    const dispatch = useDispatch();
    const comparisonData = useComparison({
        id
    });
    const { contributions, properties, data, isLoadingComparisonResult, filterControlData, updateRulesOfProperty, comparisonType } = comparisonData;

    useEffect(() => {
        if (Object.keys(comparisonData.data).length === 0) {
            return;
        }
        dispatch(
            setComparisonData({
                id,
                data: {
                    data,
                    properties,
                    metaData: comparisonData.metaData
                }
            })
        );
    }, [comparisonData, data, dispatch, id, properties]);

    useEffect(() => {
        const paperIds = contributions.map(contribution => contribution.paperId);
        if (paperIds.length === 0) {
            return;
        }
        const _usedReferences = paperIds.map(paperId => references.find(reference => reference?.parsedReference?.id === paperId));
        if (!isEqual(_usedReferences, usedReferences[sectionId])) {
            dispatch(setUsedReferences({ references: _usedReferences, sectionId }));
        }
    }, [contributions, dispatch, references, sectionId, usedReferences]);

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
    id: PropTypes.string.isRequired,
    sectionId: PropTypes.string.isRequired
};

export default SectionComparison;
