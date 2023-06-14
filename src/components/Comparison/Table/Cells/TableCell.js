import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import HierarchyIndicator from 'components/Comparison/Table/Cells/HierarchyIndicator';
import TableCellLiteral from 'components/Comparison/Table/Cells/TableCellLiteral';
import TableCellResource from 'components/Comparison/Table/Cells/TableCellResource';
import { ENTITIES } from 'constants/graphSettings';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { getCellPadding } from 'slices/comparisonSlice';
import styled from 'styled-components';

export const Item = styled.div`
    margin: 0;
    height: 100%;
    background: #fff;
`;

export const ItemInner = styled.div`
    /* padding: ${props => props.cellPadding}px 0; */
    border-right: thin solid #d5dae4;
    border-bottom: thin solid #e7eaf1;
    /* padding-left: 0.2rem; */
    height: 100%;
    overflow-wrap: anywhere;

    &:hover .create-button {
        display: block;
    }

    &.bg-cell-depth-2 {
        background: #f7f8fa;
    }
    &.bg-cell-depth-3 {
        background: #f2f3f7;
    }
    &.bg-cell-depth-4 {
        background: #edeff4;
    }
    &.bg-cell-depth-5 {
        background: #e9ebf1;
    }
    &.bg-cell-depth-6 {
        background: #e4e7ee;
    }
    &.bg-cell-depth-7 {
        background: #e0e3eb;
    }
    &.bg-cell-depth-8 {
        background: #dbdfe8;
    }
    &.bg-cell-depth-9 {
        background: #d6dbe5;
    }
    &.bg-cell-depth-deepest {
        background: #d2d7e3;
    }
`;

export const ItemInnerSeparator = styled.hr`
    margin: ${props => props.cellPadding}px auto;
    width: 100%;
    border-color: #d5dae4;
    opacity: 1;
`;

const MAX_ITEMS = 6;

const TableCell = ({ entities }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cellPadding = useSelector(getCellPadding);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);

    return (
        <>
            <Item>
                <ItemInner
                    cellPadding={cellPadding}
                    className={`${
                        comparisonType === 'property-path'
                            ? `bg-cell-depth-${entities[0].path.length < 10 ? entities[0].path.length : 'deepest'}`
                            : ''
                    } ${entities === undefined ? 'itemGroup' : ''}`}
                >
                    {entities &&
                        entities.length > 0 &&
                        entities.slice(0, !isExpanded ? MAX_ITEMS : entities?.length).map(
                            (entity, index) =>
                                Object.keys(entity).length > 0 && (
                                    <Fragment key={`value-${entity.resourceId}`}>
                                        {index > 0 && <ItemInnerSeparator cellPadding={cellPadding} />}
                                        <div className="d-flex h-100">
                                            {comparisonType === 'property-path' && <HierarchyIndicator path={entity.path} color="#b1b1b1" />}
                                            {entity.type === ENTITIES.RESOURCE ? (
                                                <TableCellResource entity={entity} index={index} />
                                            ) : (
                                                <TableCellLiteral key={index} entity={entity} />
                                            )}
                                        </div>
                                    </Fragment>
                                ),
                        )}
                    {entities?.length > MAX_ITEMS && (
                        <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={() => setIsExpanded(v => !v)}>
                            {isExpanded ? 'Hide more' : `Show ${entities.length - MAX_ITEMS} more`}{' '}
                            <Icon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                        </Button>
                    )}
                </ItemInner>
            </Item>
        </>
    );
};

TableCell.propTypes = {
    entities: PropTypes.array,
};

export default memo(TableCell, isEqual);
