import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TemplateTooltip from 'components/TemplateTooltip/TemplateTooltip';
import PropTypes from 'prop-types';
import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import {
    fillResourceWithTemplate,
    removeEmptyPropertiesOfClass,
    updateResourceClassesAction as updateResourceClasses,
} from 'slices/statementBrowserSlice';
import styled from 'styled-components';

const IconWrapper = styled.span`
    background-color: ${props => (props.addMode ? (props.isSmart ? props.theme.smart : '#d1d5e4') : '#dc3545')};
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
    width: 28px;
    border-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => (props.addMode && !props.isSmart ? props.theme.secondary : 'white')};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

const TemplateButton = props => {
    const [isSaving, setIsSaving] = useState(false);
    const ref = useRef(null);
    const dispatch = useDispatch();
    const resource = useSelector(state => props.resourceId && state.statementBrowser.resources.byId[props.resourceId]);

    const addTemplate = useCallback(() => {
        setIsSaving(true);
        dispatch(
            fillResourceWithTemplate({
                templateID: props.id,
                resourceId: props.resourceId,
                syncBackend: props.syncBackend,
            }),
        ).then(() => {
            toast.success('Template added successfully');
            ref.current?.removeAttribute('disabled');
            setIsSaving(false);
        });
    }, [dispatch, props.id, props.resourceId, props.syncBackend]);

    const deleteTemplate = useCallback(() => {
        setIsSaving(true);
        // Remove the properties related to the template if they have no values
        dispatch(removeEmptyPropertiesOfClass({ resourceId: props.resourceId, classId: props.classId }));
        dispatch(
            updateResourceClasses({
                resourceId: props.resourceId,
                classes: resource.classes?.filter(c => c !== props.classId) ?? [],
                syncBackend: props.syncBackend,
            }),
        )
            .then(() => {
                ref.current?.removeAttribute('disabled');
                setIsSaving(false);
                toast.dismiss();
                if (props.syncBackend) {
                    toast.success('Resource classes updated successfully');
                }
            })
            .catch(() => {
                ref.current?.removeAttribute('disabled');
                setIsSaving(false);
                toast.dismiss();
                toast.error('Something went wrong while updating the classes.');
            });
    }, [dispatch, props.classId, props.resourceId, props.syncBackend, resource.classes]);

    return (
        <TemplateTooltip id={props.id}>
            <span tabIndex="0">
                <Button
                    innerRef={ref}
                    onClick={() => {
                        ref.current.setAttribute('disabled', 'disabled');
                        if (props.addMode) {
                            addTemplate();
                        } else {
                            deleteTemplate();
                        }
                    }}
                    size="sm"
                    outline={props.isSmart}
                    // eslint-disable-next-line no-nested-ternary
                    color={props.addMode ? (props.isSmart ? 'smart' : 'light') : 'danger'}
                    className={`me-2 mb-2 position-relative px-3 rounded-pill ${!props.isSmart && 'border-0'}`}
                >
                    <IconWrapper addMode={props.addMode} isSmart={props.isSmart}>
                        {!isSaving && props.addMode && <Icon size="sm" icon={faPlus} />}
                        {!isSaving && !props.addMode && <Icon size="sm" icon={faTimes} />}
                        {isSaving && <Icon icon={faSpinner} spin />}
                    </IconWrapper>
                    <Label>{props.label}</Label>
                </Button>
            </span>
        </TemplateTooltip>
    );
};

TemplateButton.propTypes = {
    addMode: PropTypes.bool.isRequired,
    resourceId: PropTypes.string, // The resource that will contain the template
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    classId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    isSmart: PropTypes.bool,
    tippyTarget: PropTypes.object,
};

TemplateButton.defaultProps = {
    addMode: true,
    label: '',
    isSmart: false,
    syncBackend: false,
};

export default TemplateButton;
