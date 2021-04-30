import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import PropTypes from 'prop-types';
import { memo } from 'react';
import styled from 'styled-components';

const ButtonsContainer = styled.div`
    position: absolute;
    right: 0;
    top: -10px;
    padding: 6px;
    border-radius: 6px;
    display: none;
`;

const TableCellButtons = ({ onEdit, onDelete, backgroundColor, style }) => {
    return (
        <ButtonsContainer style={{ backgroundColor, ...style }} className="cell-buttons">
            <StatementOptionButton title={onEdit ? 'Edit' : 'This item cannot be edited'} icon={faPen} action={onEdit} isDisabled={!onEdit} />
            <StatementOptionButton
                requireConfirmation={true}
                title={onDelete ? 'Delete' : 'This item cannot be deleted'}
                confirmationMessage="Are you sure to delete?"
                icon={faTrash}
                appendTo={document.body}
                isDisabled={!onDelete}
                action={onDelete}
            />
        </ButtonsContainer>
    );
};

TableCellButtons.propTypes = {
    /** Function called when edit button is clicked. If null, the button is disabled */
    onEdit: PropTypes.func,
    /** Function called when delete button is clicked. If null, the button is disabled */
    onDelete: PropTypes.func,
    /** Background color of button container */
    backgroundColor: PropTypes.string.isRequired,
    /** Styles passed to the button container */
    style: PropTypes.object
};

TableCellButtons.defaultProps = {
    style: {},
    onEdit: null,
    onDelete: null
};

export default memo(TableCellButtons);
