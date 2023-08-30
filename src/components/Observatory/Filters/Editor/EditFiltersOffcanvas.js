import Confirm from 'components/Confirmation/Confirmation';
import EditFilterModal from 'components/Observatory/Filters/Editor/EditFilterModal';
import FilterItem from 'components/Observatory/Filters/FilterItem';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { createFiltersInObservatory, deleteFilterOfObservatory, updateFiltersOfObservatory } from 'services/backend/observatories';
import { getErrorMessage } from 'utils';

const EditFiltersOffcanvas = ({ id, filters, isOpen, toggle, refreshFilter }) => {
    const isCurator = useSelector(state => state.auth.user?.isCurationAllowed);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentFilter, setCurrentFilter] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveFilter = (filterId, filter) => {
        setIsSaving(true);
        let saveAPICall;
        if (filterId) {
            saveAPICall = updateFiltersOfObservatory(id, filterId, filter);
        } else {
            saveAPICall = createFiltersInObservatory(id, filter);
        }
        return saveAPICall
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

    const deleteFilter = async filter => {
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this filter from the observatory?',
        });

        if (isConfirmed) {
            await deleteFilterOfObservatory(id, filter.id);
            refreshFilter();
        }
    };

    return (
        <Offcanvas direction="end" isOpen={isOpen} toggle={toggle}>
            <OffcanvasHeader toggle={toggle}>Edit filters</OffcanvasHeader>
            <OffcanvasBody>
                <div className="mb-3">
                    {filters.map(filter => (
                        <FilterItem key={filter.id} filter={filter} editFilter={openEditFilterModal} removeFilter={deleteFilter} />
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
};

export default EditFiltersOffcanvas;
