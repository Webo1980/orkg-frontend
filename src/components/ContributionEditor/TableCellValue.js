import { ENTITIES } from 'constants/graphSettings';
import { deleteStatement } from 'slices/contributionEditorSlice';
import { ItemInnerSeparator } from 'components/Comparison/Table/Cells/TableCell';
import TableCellButtons from 'components/ContributionEditor/TableCellButtons';
import TableCellValueResource from 'components/ContributionEditor/TableCellValueResource';
import TableCellForm from 'components/ContributionEditor/TableCellForm/TableCellForm';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import PropTypes from 'prop-types';
import { forwardRef, memo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import env from '@beam-australia/react-env';
import styled from 'styled-components';

const Value = styled.div`
    &:hover .cell-buttons {
        display: block;
    }
`;

const TableCellValue = forwardRef(({ value, index, setDisableCreate, propertyId, contributionId, clickHistory, handleCellClick }, ref) => {
    const [isEditing, setIsEditing] = useState(false);

    const [approveStatus, setApproveStatus] = useState(false);
    const [approveStatusText, setApproveStatusText] = useState('Approve');
    const [boxShadowStyle, setBoxShadowStyle] = useState({});

    const handleApprovalClicks = () => {
        handleCellClick(value.label, approveStatus); // Pass label and approveStatus directly
        setApproveStatus(!approveStatus);
        setApproveStatusText(approveStatus ? 'Approve' : 'Disapprove');
        const newBoxShadowStyle = approveStatus
        ? { boxShadow: 'inset rgb(255 44 4 / 70%) 0px 1px 6px 1px' }
        : { boxShadow: 'inset rgba(0, 128, 0, 0.7) 0px 1px 6px 1px' };
        setBoxShadowStyle(newBoxShadowStyle);
    };

    const dispatch = useDispatch();
    const handleStartEdit = () => {
        setIsEditing(true);
        setDisableCreate(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setDisableCreate(false);
    };
    const handleDelete = () => {
        dispatch(deleteStatement(value.statementId));
    };

    return (
        <div ref={ref}>
            {!isEditing ? (
                <>
                    {index > 0 && <ItemInnerSeparator className="my-0" />}
                    <Value className="position-relative" style={boxShadowStyle} >
                        {value._class === ENTITIES.RESOURCE && <TableCellValueResource value={value} />}
                        {value._class === ENTITIES.LITERAL && (
                            <div role="textbox" tabIndex="0" onDoubleClick={env('PWC_USER_ID') !== value.created_by ? handleStartEdit : undefined}>
                                <ValuePlugins type={value._class} options={{ inModal: true }}>
                                    {value.label || <i>No label</i>}
                                </ValuePlugins>
                            </div>
                        )}
                        <TableCellButtons
                            handleApprovalClicks={handleApprovalClicks}
                            approveStatusText={approveStatusText}
                            approveStatus={approveStatus}
                            value={value}
                            onEdit={handleStartEdit}
                            onDelete={handleDelete}
                            backgroundColor="rgba(240, 242, 247, 0.8)"
                        />
                    </Value>
                </>
            ) : (
                <TableCellForm value={value} closeForm={handleStopEdit} />
            )}
        </div>
    );
});

TableCellValue.propTypes = {
    value: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    setDisableCreate: PropTypes.func.isRequired,
    clickHistory: PropTypes.array,
    handleCellClick: PropTypes.func,
    approveStatusText: PropTypes.string,
    approveStatus: PropTypes.bool,
    propertyId: PropTypes.string,
    contributionId: PropTypes.string,
};

export default memo(TableCellValue);
