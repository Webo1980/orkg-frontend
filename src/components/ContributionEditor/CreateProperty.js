import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createProperty } from 'actions/contributionEditor';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { predicatesUrl } from 'services/backend/predicates';

export const CreateProperty = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const dispatch = useDispatch();
    const { confirmProperty } = useConfirmPropertyModal();

    const handleChangeAutocomplete = async (selected, { action }) => {
        const confirmedProperty = action === 'create-option' ? await confirmProperty() : true;

        if ((action !== 'create-option' && action !== 'select-option') || !confirmedProperty) {
            return;
        }

        dispatch(
            createProperty({
                id: selected.id ?? null,
                label: inputValue,
                action
            })
        );
        setIsCreating(false);
        setInputValue('');
    };

    return !isCreating ? (
        <Button color="darkblue" size="sm" onClick={() => setIsCreating(true)}>
            <Icon icon={faPlusCircle} /> Add property
        </Button>
    ) : (
        <div style={{ maxWidth: 300 }}>
            <Autocomplete
                requestUrl={predicatesUrl}
                placeholder="Enter a property"
                onChange={handleChangeAutocomplete}
                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                value={inputValue}
                onBlur={() => setIsCreating(false)}
                openMenuOnFocus={true}
                cssClasses="form-control-sm"
                menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                allowCreate
            />
        </div>
    );
};

export default CreateProperty;
