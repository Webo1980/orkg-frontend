import { useState } from 'react';
import { InputGroup } from 'reactstrap';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { PropertyStyle } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt, faPen, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { useSelector } from 'react-redux';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import styled from 'styled-components';

const DragHandler = styled.div`
    width: 30px;
    float: left;
    padding: 10px;
`;

function TemplateComponentProperty(props) {
    const [isEditing, setIsEditing] = useState(false);
    const editMode = useSelector(state => state.templateEditor.editMode);
    const property = useSelector(state => state.templateEditor.propertyShapes[props.id].property);

    return (
        <PropertyStyle className="col-4" tabIndex="0">
            {editMode && (
                <DragHandler ref={props.dragRef}>
                    <Icon icon={faArrowsAlt} />
                </DragHandler>
            )}
            {!isEditing ? (
                <div className="propertyLabel">
                    {property?.id ? (
                        <Link to={reverse(ROUTES.PROPERTY, { id: property.id })} target="_blank" className="text-dark">
                            <DescriptionTooltip id={property.id} _class={ENTITIES.PREDICATE}>
                                {property.label}
                            </DescriptionTooltip>
                        </Link>
                    ) : (
                        property?.label
                    )}

                    {editMode && (
                        <div className="propertyOptions">
                            <StatementActionButton title="Edit property" icon={faPen} action={() => setIsEditing(true)} />
                            <StatementActionButton
                                title="Delete property"
                                icon={faTrash}
                                action={() => props.handleDeletePropertyShape(props.id)}
                                requireConfirmation={true}
                                confirmationMessage="Are you sure to delete?"
                                confirmationButtons={[
                                    {
                                        title: 'Delete',
                                        color: 'danger',
                                        icon: faCheck,
                                        action: () => props.handleDeletePropertyShape(props.id),
                                    },
                                    {
                                        title: 'Cancel',
                                        color: 'secondary',
                                        icon: faTimes,
                                    },
                                ]}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <InputGroup size="sm">
                        <AutoComplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder={isEditing ? 'Select or type to enter a property' : 'No properties'}
                            onChange={(selected, action) => {
                                props.handlePropertiesSelect(selected, action, props.id);
                                setIsEditing(false);
                            }}
                            value={property}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            cssClasses="form-control-sm"
                            onBlur={() => {
                                setIsEditing(false);
                            }}
                        />
                    </InputGroup>
                </div>
            )}
        </PropertyStyle>
    );
}

TemplateComponentProperty.propTypes = {
    id: PropTypes.number.isRequired,
    handleDeletePropertyShape: PropTypes.func.isRequired,
    handlePropertiesSelect: PropTypes.func.isRequired,
    dragRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })]),
};

export default TemplateComponentProperty;
