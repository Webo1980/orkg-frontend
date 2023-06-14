import PropertyPathList from 'components/Comparison/Table/SelectPropertiesModal/PropertyPathList';
import { isEqual, uniqWith } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { setExpandedPropertyPaths, setProperties as setPropertiesStore } from 'slices/comparisonSlice';

const SelectPropertiesModal = ({ toggle }) => {
    const [properties, setProperties] = useState([]);
    const [expandedPaths, setExpandedPaths] = useState([]);
    const [selectedPropertyPaths, setSelectedPropertyPaths] = useState([]);

    const expandedPropertyPaths = useSelector(state => state.comparison.expandedPropertyPaths);
    const propertiesStore = useSelector(state => state.comparison.properties);
    const dispatch = useDispatch();

    useEffect(() => {
        setSelectedPropertyPaths(expandedPropertyPaths);
        setExpandedPaths(expandedPropertyPaths.map(path => path.slice(0, path.length - 1)));
    }, [expandedPropertyPaths]);

    useEffect(() => {
        setProperties(propertiesStore);
    }, [propertiesStore]);

    const handleSelectPropertyPath = propertyPath => {
        setSelectedPropertyPaths(prev =>
            uniqWith(
                prev.find(item => isEqual(item, propertyPath))
                    ? prev.filter(property => !isEqual(property.slice(0, propertyPath.length), propertyPath))
                    : [...prev, ...propertyPath.map((_, index) => propertyPath.slice(0, propertyPath.length - index))],
                (a, b) => JSON.stringify(a) === JSON.stringify(b),
            ),
        );
    };

    const handleSelect = () => {
        // the properties variable contains the sorted properties, filter on the selected paths and dispatch to the store
        const propertyPathsSorted = properties
            .filter(property => selectedPropertyPaths.find(path => isEqual(property.path, path)))
            .map(property => property.path);

        dispatch(setExpandedPropertyPaths(propertyPathsSorted));
        dispatch(setPropertiesStore(properties));
        toggle();
    };

    const expandProperty = propertyPath => {
        setExpandedPaths(prev =>
            prev.find(item => isEqual(item, propertyPath)) ? prev.filter(item => !isEqual(item, propertyPath)) : [...prev, propertyPath],
        );
    };

    return (
        <Modal size="lg" isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Select properties</ModalHeader>
            <ModalBody>
                <PropertyPathList
                    properties={properties}
                    setProperties={setProperties}
                    path={[]}
                    expandedPaths={expandedPaths}
                    expandProperty={expandProperty}
                    handleSelectPropertyPath={handleSelectPropertyPath}
                    selectedPropertyPaths={selectedPropertyPaths}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSelect}>
                    Select
                </Button>
            </ModalFooter>
        </Modal>
    );
};

SelectPropertiesModal.propTypes = {
    toggle: PropTypes.func.isRequired,
};

export default SelectPropertiesModal;
