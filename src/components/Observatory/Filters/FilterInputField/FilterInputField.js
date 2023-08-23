import AutoComplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { isArray } from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Input } from 'reactstrap';

const FilterInputField = ({ filter, setFilters }) => {
    const [value, setValue] = useState('');

    const updateValue = _value => {
        setValue(_value);
        setFilters(v =>
            v.map(f => {
                if (f.id === filter.id) {
                    if (isArray(_value) && _value.length === 0) {
                        return { ...f, value: null };
                    }
                    return { ...f, value: _value };
                }
                return f;
            }),
        );
    };
    let inputFormType = 'text';

    if (filter.range) {
        switch (filter.range) {
            case CLASSES.DATE:
                inputFormType = 'date';
                break;
            case CLASSES.BOOLEAN:
                inputFormType = 'boolean';
                break;
            case 'ID':
                inputFormType = 'autocomplete';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    }

    const Forms = {
        boolean: (
            <>
                <Input
                    onChange={(e, _value) => updateValue(e ? e.target.value : _value)}
                    value={value}
                    type="select"
                    name="literalValue"
                    bsSize="sm"
                    className="flex-grow-1 d-flex"
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </Input>
            </>
        ),
        autocomplete: (
            <>
                <AutoComplete
                    entityType={ENTITIES.RESOURCE}
                    placeholder="Select or type to enter a resource"
                    onChange={(selected, action) => {
                        updateValue(selected);
                    }}
                    value={value}
                    autoLoadOption={true}
                    openMenuOnFocus={true}
                    isClearable
                    autoFocus={false}
                    ols={false}
                    isMulti={true}
                    cssClasses="form-control-sm"
                />
            </>
        ),
        default: (
            <>
                <Input
                    placeholder="Enter a value"
                    name="literalValue"
                    type={inputFormType}
                    bsSize="sm"
                    value={value}
                    onChange={(e, _value) => setValue(e ? e.target.value : _value)}
                    className="flex-grow d-flex"
                    autoFocus
                />
            </>
        ),
    };

    return <>{Forms[inputFormType] || Forms.default}</>;
};

FilterInputField.propTypes = {
    filter: PropTypes.object,
    setFilters: PropTypes.func,
};

export default FilterInputField;
