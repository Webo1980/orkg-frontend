import SelectPropertiesModal from 'components/Comparison/Table/SelectPropertiesModal/SelectPropertiesModal';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';

const ColumnHeaderFirstColumn = () => {
    const transpose = useSelector(state => state.comparison.configuration.transpose);
    const [isOpenSelectStatementsModal, setIsOpenSelectStatementsModal] = useState(false);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);
    const isEditing = useSelector(state => state.comparison.isEditing);

    return (
        <Properties>
            <PropertiesInner transpose={transpose} className="first d-flex flex-column py-1 px-2">
                <span>Properties</span>
                {isEditing && comparisonType === 'property-path' && (
                    <div className="mt-auto">
                        <Button color="secondary-darker" size="sm" onClick={() => setIsOpenSelectStatementsModal(true)}>
                            Manage properties
                        </Button>
                    </div>
                )}
            </PropertiesInner>
            {isOpenSelectStatementsModal && <SelectPropertiesModal toggle={() => setIsOpenSelectStatementsModal(v => !v)} />}
        </Properties>
    );
};

export default ColumnHeaderFirstColumn;
