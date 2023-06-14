import PropertyPathListItem from 'components/Comparison/Table/SelectPropertiesModal/PropertyPathListItem';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';

const PropertyPathList = ({ properties, setProperties, path, expandedPaths, expandProperty, handleSelectPropertyPath, selectedPropertyPaths }) => (
    <ul className={`list-unstyled mb-0 ${path.length !== 0 ? 'ms-4' : ''}`}>
        {properties
            .filter(property => isEqual(path, property.path.slice(0, path.length)) && property.path.length - 1 === path.length)
            .map(property => (
                <PropertyPathListItem
                    key={property.path.join('/')}
                    properties={properties}
                    setProperties={setProperties}
                    property={property}
                    expandedPaths={expandedPaths}
                    expandProperty={expandProperty}
                    handleSelectPropertyPath={handleSelectPropertyPath}
                    selectedPropertyPaths={selectedPropertyPaths}
                    index={properties.findIndex(_property => isEqual(_property.path, property.path))}
                />
            ))}
    </ul>
);

PropertyPathList.propTypes = {
    properties: PropTypes.array.isRequired,
    setProperties: PropTypes.func.isRequired,
    path: PropTypes.array.isRequired,
    expandedPaths: PropTypes.array.isRequired,
    expandProperty: PropTypes.func.isRequired,
    handleSelectPropertyPath: PropTypes.func.isRequired,
    selectedPropertyPaths: PropTypes.array.isRequired,
};

export default PropertyPathList;
