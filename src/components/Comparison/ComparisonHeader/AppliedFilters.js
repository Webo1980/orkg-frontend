import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { areAllRulesEmpty, applyRule, activatedContributionsToList } from 'utils';
import AppliedRule from 'components/Comparison/Filters/AppliedRule';
import { useSelector, useDispatch } from 'react-redux';
import { setComparisonContributionList, setComparisonContributions, setComparisonFilterControlData } from 'actions/comparison';
import { intersection } from 'lodash';

export default function AppliedFilters() {
    const dispatch = useDispatch();
    const contributions = useSelector(state => state.comparison.contributions);
    const filterControlData = useSelector(state => state.comparison.filterControlData);

    /**
     * Remove a rule from filter control data of a property
     *
     * @param {Array} propertyId property ID
     * @param {String} type Filter type
     * @param {String} value Filter value
     */
    const removeRule = ({ propertyId, type, value }) => {
        const newState = [...filterControlData];
        const toChangeIndex = newState.findIndex(item => item.property.id === propertyId);
        const toChange = { ...newState[toChangeIndex] };
        toChange.rules = toChange.rules.filter(item => !(item.propertyId === propertyId && item.type === type && item.value === value));
        newState[toChangeIndex] = toChange;
        applyAllRules(newState);
        dispatch(setComparisonFilterControlData(newState));
    };

    /**
     * display certain contributionIds
     *
     * @param {array} contributionIds Contribution ids to display
     */
    const displayContributions = contributionIds => {
        const newContributions = contributions.map(contribution => {
            return contributionIds.includes(contribution.id) ? { ...contribution, active: true } : { ...contribution, active: false };
        });
        dispatch(setComparisonContributionList(activatedContributionsToList(newContributions)));
        dispatch(setComparisonContributions(newContributions));
        //setUrlNeedsToUpdate(true);
    };

    /**
     * Apply filter control data rules
     *
     * @param {Array} newState Filter Control Data
     */
    const applyAllRules = newState => {
        const AllContributionsID = contributions.map(contribution => contribution.id);
        const contributionIds = []
            .concat(...newState.map(item => item.rules))
            .map(c => applyRule({ filterControlData, ...c }))
            .reduce((prev, acc) => intersection(prev, acc), AllContributionsID);
        displayContributions(contributionIds);
    };

    const removeRuleFactory = ({ propertyId, type, value }) => () => removeRule({ propertyId, type, value });

    const displayRules = () => {
        return []
            .concat(...filterControlData.map(item => item.rules))
            .map(({ propertyId, propertyName, type, value }) => (
                <AppliedRule
                    key={`${propertyId}#${type}`}
                    data={{ propertyId, propertyName, type: type, value, removeRule: removeRuleFactory({ propertyId, type, value }) }}
                />
            ));
    };
    return (
        <div>
            {areAllRulesEmpty(filterControlData) && (
                <div className="mt-3 d-flex" style={{ flexDirection: 'column' }}>
                    <h6 className="text-secondary">
                        <Icon className="mr-1" size="sm" icon={faFilter} />
                        <b>Applied Filters:</b>
                    </h6>
                    <div className="d-flex flex-wrap">{displayRules()}</div>
                </div>
            )}
        </div>
    );
}
