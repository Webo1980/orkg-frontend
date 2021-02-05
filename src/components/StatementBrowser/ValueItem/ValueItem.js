import { useState } from 'react';
import {
    selectResource,
    fetchStatementsForResource,
    deleteValue,
    updateValueLabel,
    createResource,
    doneSavingValue,
    isSavingValue,
    changeValue
} from 'actions/statementBrowser';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createResource as createResourceAPICall, updateResource } from 'services/backend/resources';
import { updateLiteral } from 'services/backend/literals';
import { toast } from 'react-toastify';
import { guid } from 'utils';
import { uniq } from 'lodash';
import format from 'string-format';
import ValueItemTemplate from './ValueItemTemplate';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { PREDICATES } from 'constants/graphSettings';

export default function ValueItem(props) {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { resources, values, properties, openExistingResourcesInDialog, classes, templates } = statementBrowser;

    const [modal, setModal] = useState(false);
    const [modalDataset, setModalDataset] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const commitChangeLabel = async draftLabel => {
        // Check if the user changed the label
        if (draftLabel !== props.value.label) {
            dispatch(
                updateValueLabel({
                    label: draftLabel,
                    valueId: props.id
                })
            );
            if (props.syncBackend) {
                dispatch(isSavingValue({ id: props.id })); // To show the saving message instead of the value label
                if (props.value.resourceId) {
                    if (props.value.type === 'literal') {
                        await updateLiteral(props.value.resourceId, draftLabel);
                        toast.success('Literal label updated successfully');
                    } else {
                        await updateResource(props.value.resourceId, draftLabel);
                        toast.success('Resource label updated successfully');
                    }
                }
                dispatch(doneSavingValue({ id: props.id }));
            }
        }
    };

    const handleChangeResource = async (selectedOption, a) => {
        // Check if the user changed the value
        if (props.value.label !== selectedOption.label || props.value.resourceId !== selectedOption.id) {
            dispatch(isSavingValue({ id: props.id })); // To show the saving message instead of the value label
            if (a.action === 'select-option') {
                changeValueInStatementBrowser({ ...selectedOption, isExistingValue: true });
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (props.syncBackend) {
                    newResource = await createResourceAPICall(selectedOption.label);
                    newResource['isExistingValue'] = true;
                } else {
                    newResource = { id: guid(), isExistingValue: false, label: selectedOption.label, type: 'object', classes: [], shared: 1 };
                }
                await changeValueInStatementBrowser(newResource);
            }
            dispatch(doneSavingValue({ id: props.id }));
        }
    };

    const changeValueInStatementBrowser = async newResource => {
        if (props.syncBackend && props.value.statementId) {
            await updateStatement(props.value.statementId, { object_id: newResource.id });
            dispatch(
                changeValue({
                    valueId: props.id,
                    ...{
                        classes: newResource.classes,
                        label: newResource.label,
                        resourceId: newResource.id,
                        existingResourceId: newResource.id,
                        isExistingValue: newResource.isExistingValue,
                        existingStatement: true,
                        statementId: props.value.statementId,
                        shared: newResource.shared
                    }
                })
            );
            toast.success('Value updated successfully');
        } else {
            dispatch(
                changeValue({
                    valueId: props.id,
                    ...{
                        classes: newResource.classes,
                        label: newResource.label,
                        resourceId: newResource.id,
                        existingResourceId: newResource.isExistingValue ? newResource.id : null,
                        isExistingValue: newResource.isExistingValue,
                        existingStatement: false,
                        statementId: null,
                        shared: newResource.shared
                    }
                })
            );
        }
    };

    const handleDeleteValue = async () => {
        if (props.syncBackend) {
            await deleteStatementById(props.value.statementId);
            toast.success('Statement deleted successfully');
        }
        dispatch(
            deleteValue({
                id: props.id,
                propertyId: props.propertyId
            })
        );
    };

    const handleResourceClick = async e => {
        const resource = resources.byId[props.value.resourceId];
        const existingResourceId = resource.existingResourceId;

        if (existingResourceId) {
            dispatch(
                fetchStatementsForResource({
                    resourceId: props.value.resourceId,
                    existingResourceId,
                    depth: 3
                })
            );
        }

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: props.value.resourceId,
                label: props.value.label,
                propertyLabel: properties.byId[props.propertyId]?.label
            })
        );
    };

    const handleDatasetResourceClick = ressource => {
        dispatch(
            createResource({
                label: ressource.rlabel ? ressource.rlabel : ressource.label,
                existingResourceId: ressource.id,
                resourceId: ressource.id
            })
        );

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: ressource.id,
                label: ressource.rlabel ? ressource.rlabel : ressource.label,
                propertyLabel: properties.byId[props.propertyId]?.label
            })
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: ressource.id,
                existingResourceId: ressource.id
            })
        );
    };

    const handleExistingResourceClick = async () => {
        const resource = resources.byId[props.value.resourceId];
        const existingResourceId = resource.existingResourceId ? resource.existingResourceId : props.value.resourceId;

        // Load template of this class
        //show the statement browser
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
        setModal(true);
    };

    const handleDatasetClick = () => {
        const resource = resources.byId[props.value.resourceId];
        const existingResourceId = resource.existingResourceId;

        setModalDataset(true);
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
    };

    const resource = resources.byId[props.value.resourceId];
    const value = values.byId[props.id];

    const existingResourceId = resource ? resource.existingResourceId : false;
    let handleOnClick = null;

    if (
        (props.value.type === 'object' || props.value.type === 'template') &&
        (existingResourceId || props.contextStyle !== 'StatementBrowser') &&
        openExistingResourcesInDialog
    ) {
        handleOnClick = handleExistingResourceClick;
    } else if (props.value.type === 'object' || props.value.type === 'template') {
        handleOnClick = handleResourceClick;
    }

    const generatedFormattedLabel = labelFormat => {
        const resource = resources.byId[props.value.resourceId];
        const valueObject = {};
        for (const propertyId of resource.propertyIds) {
            const property = properties.byId[propertyId];
            valueObject[property.existingPredicateId] =
                property?.valueIds && property.valueIds.length > 0 ? values.byId[property.valueIds[0]].label : property.label;
        }
        if (Object.keys(valueObject).length > 0) {
            return format(labelFormat, valueObject);
        } else {
            return props.value.label;
        }
    };

    const getLabel = () => {
        if (props.value.classes) {
            // get all template ids
            let templateIds = [];
            for (const c of props.value.classes) {
                if (classes[c]) {
                    templateIds = templateIds.concat(classes[c].templateIds);
                }
            }
            templateIds = uniq(templateIds);
            // check if it formatted label
            let hasLabelFormat = false;
            let labelFormat = '';
            for (const templateId of templateIds) {
                const template = templates[templateId];
                if (template && template.hasLabelFormat) {
                    hasLabelFormat = true;
                    labelFormat = template.labelFormat;
                }
            }
            if (!hasLabelFormat) {
                return props.value.label;
            }

            if (existingResourceId && !resource.isFetched && !resource.isFetching) {
                dispatch(
                    fetchStatementsForResource({
                        resourceId: props.value.resourceId,
                        existingResourceId
                    })
                ).then(() => {
                    return generatedFormattedLabel(labelFormat);
                });
            } else {
                return generatedFormattedLabel(labelFormat);
            }
        } else {
            return props.value.label;
        }
    };

    return (
        <>
            <ValueItemTemplate
                isProperty={[PREDICATES.TEMPLATE_COMPONENT_PROPERTY, PREDICATES.TEMPLATE_OF_PREDICATE].includes(
                    properties.byId[props.propertyId]?.existingPredicateId
                )}
                id={props.id}
                value={value}
                resource={resource}
                predicate={properties.byId[props.propertyId]}
                handleOnClick={handleOnClick}
                handleChangeResource={handleChangeResource}
                commitChangeLabel={commitChangeLabel}
                handleDatasetClick={handleDatasetClick}
                enableEdit={props.enableEdit}
                handleDeleteValue={handleDeleteValue}
                showHelp={props.showHelp}
                getLabel={getLabel}
                components={props.components}
            />

            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    newStore={Boolean(props.contextStyle === 'StatementBrowser' || existingResourceId)}
                    enableEdit={props.enableEdit && props.contextStyle !== 'StatementBrowser' && !existingResourceId}
                />
            ) : (
                ''
            )}

            {modalDataset && (
                <RDFDataCube
                    show={modalDataset}
                    handleResourceClick={handleDatasetResourceClick}
                    toggleModal={() => setModalDataset(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                />
            )}
        </>
    );
}

ValueItem.propTypes = {
    value: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    contextStyle: PropTypes.string.isRequired,
    showHelp: PropTypes.bool,
    components: PropTypes.array.isRequired
};

ValueItem.defaultProps = {
    contextStyle: 'StatementBrowser',
    showHelp: false
};
