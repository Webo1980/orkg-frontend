import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    getPropertyIdByByResourceAndPredicateId,
    getPropertyShapesByResourceIDAndPredicateID,
    getValuesByByResourceAndPredicateId,
    selectResourceAction as selectResource,
} from 'slices/statementBrowserSlice';

const FlashCardValue = ({ resourceId, predicateId }) => {
    const propertyShape = useSelector(state => getPropertyShapesByResourceIDAndPredicateID(state, resourceId, predicateId));
    const propertyId = useSelector(state => getPropertyIdByByResourceAndPredicateId(state, resourceId, predicateId));
    const property = useSelector(state => (propertyId ? state.statementBrowser.properties.byId[propertyId] : null));
    const valuesIds = useSelector(state => getValuesByByResourceAndPredicateId(state, resourceId, predicateId));
    const value = useSelector(state => (valuesIds?.length > 0 ? state.statementBrowser.values.byId[valuesIds[0]] : null));
    const dispatch = useDispatch();

    const handleValueClick = e => {
        e.stopPropagation();
        if (value._class !== ENTITIES.LITERAL) {
            dispatch(
                selectResource({
                    increaseLevel: true,
                    resourceId: value.resourceId,
                    label: value.label ? value.label : 'No label',
                    propertyLabel: property?.label,
                }),
            );
        }
    };

    if (value?._class === ENTITIES.LITERAL && value?.label) {
        return <>{value?.label}</>;
    }

    return (
        <>
            {value?.label ? (
                <span
                    onKeyDown={e => (e.key === 'Enter' ? handleValueClick(e) : undefined)}
                    role="button"
                    tabIndex={0}
                    className="text-primary"
                    onClick={e => handleValueClick(e)}
                >
                    {value?.label}
                </span>
            ) : (
                <u>{propertyShape?.[0]?.placeholder}</u>
            )}
        </>
    );
};

FlashCardValue.propTypes = {
    predicateId: PropTypes.string,
    resourceId: PropTypes.string,
};

export default FlashCardValue;
