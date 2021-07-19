import { setComparisonData } from 'actions/smartReview';
import EmbeddedComparison from 'components/Comparison/EmbeddedComparison/EmbeddedComparison';
import { useState, useEffect } from 'react';
import configureStore from 'store';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { setUsedReferences } from 'actions/smartReview';
import { isEqual } from 'lodash';

const SectionComparison = ({ id, sectionId }) => {
    const references = useSelector(state => state.smartReview.references);
    const usedReferences = useSelector(state => state.smartReview.usedReferences);
    const dispatch = useDispatch();
    const [store, setStore] = useState(null);

    const setComparisonDataCallBack = data => {
        if (Object.keys(data).length === 0) {
            return;
        }
        dispatch(
            setComparisonData({
                id,
                data: data
            })
        );
    };

    const updateReferences = contributions => {
        const paperIds = contributions.map(contribution => contribution.paperId);
        if (paperIds.length === 0) {
            return;
        }
        const _usedReferences = paperIds.map(paperId => references.find(reference => reference?.parsedReference?.id === paperId));
        if (!isEqual(_usedReferences, usedReferences[sectionId])) {
            dispatch(setUsedReferences({ references: _usedReferences, sectionId }));
        }
    };
    useEffect(() => {
        setStore(configureStore());
    }, []);

    return (
        <>
            {store && id && (
                <Provider store={store}>
                    <EmbeddedComparison id={id} updateReferences={updateReferences} setComparisonDataCallBack={setComparisonDataCallBack} />
                </Provider>
            )}
        </>
    );
};

SectionComparison.propTypes = {
    id: PropTypes.string.isRequired,
    sectionId: PropTypes.string.isRequired
};

export default SectionComparison;
