import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useState } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createResource } from 'services/backend/resources';
import { createResourceData } from 'services/similarity/index';
import { getComparisonURLConfig } from 'components/Comparison/hooks/helpers';
import { useSelector } from 'react-redux';

const SaveDraft = ({ isOpen, toggle }) => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [savedDraftId, setSavedDraftId] = useState(null);
    const comparisonURLConfig = useSelector(state => getComparisonURLConfig(state.comparison));

    const saveDraft = async () => {
        if (!title || !title.trim()) {
            toast.error('Enter a comparison title');
            return;
        }

        setIsLoading(true);
        const draftComparison = await createResource(title, [CLASSES.COMPARISON_DRAFT]);
        await createResourceData({
            resourceId: draftComparison.id,
            data: { url: comparisonURLConfig },
        });
        setSavedDraftId(draftComparison.id);
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Save as draft</ModalHeader>
            <ModalBody>
                {!savedDraftId ? (
                    <>
                        <Alert color="info">
                            You can access draft comparisons from your account page. Different from published comparisons, it is possible to change or
                            remove draft comparisons later
                        </Alert>
                        <FormGroup>
                            <Label for="draft-title">Title</Label>
                            <Input type="text" id="draft-title" value={title} onChange={e => setTitle(e.target.value)} />
                        </FormGroup>
                    </>
                ) : (
                    <Alert color="success">
                        Draft comparison saved successfully.{' '}
                        <Link to={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-comparisons' })}>View draft comparisons</Link>
                    </Alert>
                )}
            </ModalBody>
            {!savedDraftId && (
                <ModalFooter>
                    <Button color="primary" disabled={isLoading} onClick={saveDraft}>
                        {isLoading && <Icon icon={faSpinner} spin />} Save
                    </Button>
                </ModalFooter>
            )}
        </Modal>
    );
};

SaveDraft.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default SaveDraft;
