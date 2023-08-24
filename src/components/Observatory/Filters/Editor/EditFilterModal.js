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
import { Button, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const EditFilterModal = ({ isSaving, isOpen, toggle, handleSave, filter = null }) => {
    const [label, setLabel] = useState(filter ? filter.label : '');
    const [path, setPath] = useState(filter ? filter.path : '');
    const [range, setRange] = useState(filter ? filter.range : null);
    const classAutocompleteRef = useRef(null);

    const handleSaveClick = async () => {
        if (!label || !path || !range) {
            toast.warning('All fields are required!');
            return;
        }
        await handleSave({ label, path: path?.split(','), range: range.id });
        toggle();
    };

    useEffect(() => {
        setLabel(filter ? filter.label : '');
        setPath(filter ? filter.path : '');
        setRange(filter ? filter.range : null);
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
                        <Input
                            id="path"
                            name="path"
                            type="text"
                            value={path}
                            placeholder="Enter the path for the value from the contribution resource"
                            onChange={e => setPath(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="label">Range</Label>
                        <AutoComplete
                            entityType={ENTITIES.CLASS}
                            placeholder="Select or type to enter a class"
                            onChange={(selected, action) => {
                                // blur the field allows to focus and open the menu again
                                if (classAutocompleteRef.current) {
                                    classAutocompleteRef.current.blur();
                                }
                                setRange(selected);
                            }}
                            value={range}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            copyValueButton={true}
                            isClearable
                            defaultOptions={DATA_TYPES.filter(dt => dt.classId !== CLASSES.RESOURCE).map(dt => ({ label: dt.name, id: dt.classId }))}
                            innerRef={classAutocompleteRef}
                            linkButton={range && range.id ? reverse(ROUTES.CLASS, { id: range.id }) : ''}
                            linkButtonTippy="Go to class page"
                            autoFocus={false}
                            ols={true}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={toggle}>
                        Cancel
                    </Button>
                    <ButtonWithLoading isLoading={isSaving} color="primary" onClick={handleSaveClick}>
                        Save
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
