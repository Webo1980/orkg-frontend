import useComparisonPropertyPath from 'components/Comparison/Table/hooks/useComparisonPropertyPath';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { ENTITIES } from 'constants/graphSettings';
import { isEqual, sortBy, uniqWith } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { setContributionStatements, setExpandedPropertyPaths, setProperties } from 'slices/comparisonSlice';

const StatementBrowser = ({ entity, toggle }) => {
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);
    const [dialogResourceType, setDialogResourceType] = useState(ENTITIES.RESOURCE);
    const [path, setPath] = useState([]);

    const contributions = useSelector(state => state.comparison.contributions);
    const properties = useSelector(state => state.comparison.properties);
    const isEditing = useSelector(state => state.comparison.isEditing);
    const expandedPropertyPaths = useSelector(state => state.comparison.expandedPropertyPaths);
    const { getUniqueProperties } = useComparisonPropertyPath();
    const propertiesInComparison = expandedPropertyPaths.map(_path => properties.find(p => isEqual(p.path, _path)));
    const dispatch = useDispatch();

    const openStatementBrowser = (id, label, type = null, _path = []) => {
        setDialogResourceId(id);
        setDialogResourceLabel(label);
        setDialogResourceType(type || ENTITIES.RESOURCE);
        setPath(_path);
    };

    useEffect(() => {
        openStatementBrowser(entity.resourceId, entity.label, null, entity.pathLabels);
    }, [entity.label, entity.pathLabels, entity.resourceId]);

    const handleCloseStatementBrowser = () => {
        const reloadContribution = async () => {
            const allStatementPromise = contributions.map(c => getStatementsBundleBySubject({ id: c.id, maxLevel: 20 }));
            const allStatements = await Promise.all(allStatementPromise);
            dispatch(setContributionStatements(allStatements));
            let uniqueProperties = getUniqueProperties(allStatements);
            uniqueProperties = sortBy(uniqueProperties, item => {
                const index = properties.findIndex(property => property.id === item.id);
                return index !== -1 ? index : null;
            });
            // const uniqueProperties = uniqWith(
            //     // merge the properties from the store with the new ones, to keep the original order
            //     [
            //         // filter out properties that were present in store but not in new data (e.g. data is removed)
            //         ...properties.filter(property =>
            //             newUniqueProperties.find(property2 => JSON.stringify(property.path) === JSON.stringify(property2.path)),
            //         ),
            //         ...newUniqueProperties,
            //     ],
            //     (a, b) => JSON.stringify(a.path) === JSON.stringify(b.path),
            // );
            const _expandedPropertyPaths = expandedPropertyPaths.filter(_path => uniqueProperties.find(p => isEqual(p.path, _path)));
            if (_expandedPropertyPaths.length === 0) {
                const firstLevelPropertyIds = uniqueProperties.filter(p => p.path.length === 1).map(p => [p.id]);
                dispatch(setExpandedPropertyPaths(firstLevelPropertyIds));
            } else {
                dispatch(setExpandedPropertyPaths(_expandedPropertyPaths)); // remove property paths that are not in the new data
            }
            dispatch(setProperties(uniqueProperties));
        };
        reloadContribution();
    };

    return (
        <StatementBrowserDialog
            show
            toggleModal={toggle}
            id={dialogResourceId}
            label={dialogResourceLabel}
            type={dialogResourceType}
            initialPath={path}
            enableEdit={isEditing}
            propertiesInComparison={propertiesInComparison}
            isSharedResourceEditable
            syncBackend
            onCloseModal={handleCloseStatementBrowser}
        />
    );
};

StatementBrowser.propTypes = {
    toggle: PropTypes.func.isRequired,
    entity: PropTypes.object.isRequired,
};

export default StatementBrowser;
