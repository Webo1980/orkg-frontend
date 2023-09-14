import TableCellValue from 'components/ContributionEditor/TableCellValue';
import TableCellValueCreate from 'components/ContributionEditor/TableCellValueCreate';
import { Item, ItemInner } from 'components/Comparison/Table/Cells/TableCell';
import ManageComparisonWizard from 'pages/Comparisons/ComparisonWizard/ManageComparisonWizard';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useState, useEffect } from 'react';
import env from '@beam-australia/react-env';
import { useSelector } from 'react-redux';
import FlipMove from 'react-flip-move';

const TableCell = ({ values, contributionId, propertyId, clickHistory, handleCellClick }) => {
    const [disableCreate, setDisableCreate] = useState(false);
    const contribution = useSelector(state => state.contributionEditor.contributions[contributionId] || '');
    return (
            <>
                    <Item className="position-relative">
                        <ItemInner cellPadding={10}>
                            <FlipMove duration={700} enterAnimation="accordionVertical" leaveAnimation="accordionVertical">
                                {values.map((value, index) => {
                                    if (Object.keys(value).length === 0) {
                                        return null;
                                    }
                                    return (
                                        <TableCellValue
                                            propertyId={propertyId}
                                            contributionId={contributionId}
                                            key={`value-${value.statementId}`}
                                            value={value}
                                            index={index}
                                            setDisableCreate={setDisableCreate}
                                            clickHistory={clickHistory}
                                            handleCellClick={(label, approved) => handleCellClick(contributionId, propertyId, label, approved)}
                                        />
                                    );
                                })}
                            </FlipMove>
                            {env('PWC_USER_ID') !== contribution?.created_by && (
                                <TableCellValueCreate
                                    isVisible={!disableCreate}
                                    contributionId={contributionId}
                                    propertyId={propertyId}
                                    isEmptyCell={values.length === 0}
                                />
                            )}
                        </ItemInner>
                    </Item>
            </>
    );
};

TableCell.propTypes = {
    values: PropTypes.array,
    contributionId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    clickHistory: PropTypes.array,
    handleCellClick: PropTypes.func,
};

const propsAreEqual = (prevProps, nextProps) => isEqual(prevProps, nextProps);

export default memo(TableCell, propsAreEqual);
