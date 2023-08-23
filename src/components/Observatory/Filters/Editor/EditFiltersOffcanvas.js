import arrayMove from 'array-move';
import EditFilterModal from 'components/Observatory/Filters/Editor/EditFilterModal';
import SortableFilterItem from 'components/Observatory/Filters/SortableFilterItem';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Offcanvas, OffcanvasBody, OffcanvasHeader, Alert } from 'reactstrap';
import { createFiltersInObservatory } from 'services/backend/observatories';
import { getErrorMessage } from 'utils';

const EditFiltersOffcanvas = ({ id, filters, isOpen, toggle, refreshFilter, setFilters }) => {
    const isCurator = useSelector(state => state.auth.user?.isCurationAllowed);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentFilter, setCurrentFilter] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveFilter = filter => {
        setIsSaving(true);
        return createFiltersInObservatory(id, filter)
            .then(() => {
                refreshFilter();
                setCurrentFilter(null);
                setIsSaving(false);
            })
            .catch(e => {
                toast.error(`Something went wrong while saving the filter! ${getErrorMessage(e) ?? e?.message}`);
                setIsSaving(false);
            });
    };

    if (filters.length === 0 && !isCurator) {
        return null;
    }

    const openEditFilterModal = filter => {
        setCurrentFilter(filter);
        setShowEditDialog(v => !v);
    };

    const deleteFilter = filter => {
        console.log('Delete filter');
    };
    const handleUpdateOrder = ({ dragIndex, hoverIndex }) => {
        setFilters(arrayMove(filters, dragIndex, hoverIndex));
    };

    return (
        <Offcanvas direction="end" isOpen={isOpen} toggle={toggle}>
            <OffcanvasHeader toggle={toggle}>Edit filters</OffcanvasHeader>
            <OffcanvasBody>
                <div className="mb-3">
                    {filters.map((filter, index) => (
                        <SortableFilterItem
                            key={filter.id}
                            filter={filter}
                            filterIndex={index}
                            editFilter={openEditFilterModal}
                            removeFilter={deleteFilter}
                            handleUpdate={handleUpdateOrder}
                        />
                    ))}
                    {filters.length === 0 && <Alert color="light">No filters in this observatory yet!</Alert>}
                </div>
                <div>
                    <Button color="primary" onClick={() => openEditFilterModal(null)}>
                        Add filter
                    </Button>
                </div>
            </OffcanvasBody>
            <EditFilterModal
                isSaving={isSaving}
                filter={currentFilter}
                isOpen={showEditDialog}
                toggle={() => setShowEditDialog(v => !v)}
                handleSave={handleSaveFilter}
            />
        </Offcanvas>
    );
};

EditFiltersOffcanvas.propTypes = {
    id: PropTypes.string,
    filters: PropTypes.array,
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    refreshFilter: PropTypes.func,
    setFilters: PropTypes.func,
};

export default EditFiltersOffcanvas;
