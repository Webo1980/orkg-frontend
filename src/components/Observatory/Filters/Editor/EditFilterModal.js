import AutoComplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import ModalWithLoading from 'components/ModalWithLoading/ModalWithLoading';
import DATA_TYPES from 'constants/DataTypes.js';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, FormText, Input, Label, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getClassById } from 'services/backend/classes';
import { getPredicate } from 'services/backend/predicates';

const EditFilterModal = ({ isSaving, isOpen, toggle, handleSave, filter = null }) => {
    const [label, setLabel] = useState(filter ? filter.label : '');
    const [path, setPath] = useState(filter ? filter.path : []);
    const [range, setRange] = useState(filter ? filter.range : null);
    const [featured, setFeatured] = useState(filter ? filter.featured : false);
    const [isLoadingEntities, setIsLoadingEntities] = useState(false);
    const classAutocompleteRef = useRef(null);
    const pathAutocompleteRef = useRef(null);

    const handleSaveClick = async () => {
        if (!label || path?.length === 0 || !range) {
            toast.warning('All fields are required!');
            return;
        }
        await handleSave(filter?.id ?? null, { label, path: path?.map(p => p.id), range: range.id, featured });
        toggle();
    };

    useEffect(() => {
        const loadEntities = async () => {
            setIsLoadingEntities(true);
            const _path = await Promise.all(filter.path.map(p => getPredicate(p)));
            const _range = await getClassById(filter.range);
            setPath(_path);
            setRange(_range);
            setIsLoadingEntities(false);
        };
        if (filter) {
            loadEntities();
        } else {
            setPath([]);
            setRange(null);
        }
        setLabel(filter ? filter.label : '');
        setFeatured(filter ? filter.featured : false);
    }, [filter]);

    return (
        <div>
            <ModalWithLoading isLoading={isSaving} isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>{filter ? 'Edit' : 'Add'} Filter</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="label">Filter label</Label>
                        <Input
                            id="label"
                            name="label"
                            type="text"
                            placeholder="Enter label for the filter"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="path">Path</Label>
                        <AutoComplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder="Select or type to enter a property"
                            onChange={selected => {
                                // blur the field allows to focus and open the menu again
                                if (pathAutocompleteRef.current) {
                                    pathAutocompleteRef.current.blur();
                                }
                                setPath(selected);
                            }}
                            value={!isLoadingEntities ? path : 'Loading...'}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={false}
                            copyValueButton={false}
                            isClearable
                            innerRef={pathAutocompleteRef}
                            autoFocus={false}
                            ols={false}
                            isMulti={true}
                            isDisabled={isLoadingEntities}
                        />
                        <FormText>
                            Select the path of properties to the value after the contribution node, they should be in the correct order
                        </FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="range">Range</Label>
                        <AutoComplete
                            entityType={ENTITIES.CLASS}
                            placeholder="Select or type to enter a class"
                            onChange={selected => {
                                // blur the field allows to focus and open the menu again
                                if (classAutocompleteRef.current) {
                                    classAutocompleteRef.current.blur();
                                }
                                setRange(selected);
                            }}
                            value={!isLoadingEntities ? range : 'Loading...'}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={false}
                            copyValueButton={false}
                            isClearable
                            defaultOptions={DATA_TYPES.filter(dt => dt.classId !== CLASSES.RESOURCE).map(dt => ({ label: dt.name, id: dt.classId }))}
                            innerRef={classAutocompleteRef}
                            linkButton={range && range.id ? reverse(ROUTES.CLASS, { id: range.id }) : ''}
                            linkButtonTippy="Go to class page"
                            autoFocus={false}
                            ols={false}
                            isDisabled={isLoadingEntities}
                        />
                        <FormText>Select the class of the value</FormText>
                    </FormGroup>
                    <FormGroup switch>
                        <Input
                            type="switch"
                            checked={featured}
                            onClick={() => {
                                setFeatured(!featured);
                            }}
                            id="featured"
                        />
                        <Label check for="featured">
                            Show this filter by default on the observatory page
                        </Label>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={toggle}>
                        Cancel
                    </Button>
                    <ButtonWithLoading isLoading={isSaving} color="primary" onClick={handleSaveClick}>
                        {!filter ? 'Create' : 'Save'}
                    </ButtonWithLoading>
                </ModalFooter>
            </ModalWithLoading>
        </div>
    );
};

EditFilterModal.propTypes = {
    isOpen: PropTypes.bool,
    isSaving: PropTypes.bool,
    toggle: PropTypes.func,
    handleSave: PropTypes.func,
    filter: PropTypes.object,
};

export default EditFilterModal;
