import React from 'react';
import { StyledStatementItem } from 'components/StatementBrowser/styled';
import DndTypes from 'constants/DndTypes';
import { useDrop } from 'react-dnd';
import PropTypes from 'prop-types';

export default function NoData(props) {
    const [{ canDrop }] = useDrop({
        accept: DndTypes.VALUE,
        canDrop: () => {
            return true;
        },
        drop: (item, monitor) => {
            if (monitor.didDrop()) {
                return;
            }
        },
        collect: monitor => ({
            isOverCurrent: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop(),
            itemToDrop: monitor.getItem()
        })
    });

    return (
        <StyledStatementItem style={{ marginBottom: 0 }} className="noTemplate">
            No data yet
            <br />
            {props.enableEdit ? (
                !props.templatesFound ? (
                    <span style={{ fontSize: '0.875rem' }}>Start by adding a property from below</span>
                ) : (
                    <span style={{ fontSize: '0.875rem' }}>Start by using a template or adding property</span>
                )
            ) : (
                <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
            )}
            <br />
            {canDrop && (
                <i>
                    <br />
                    Please insert a property first, then you can drag the values here.
                </i>
            )}
        </StyledStatementItem>
    );
}

NoData.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
    templatesFound: PropTypes.bool.isRequired
};

NoData.defaultProps = {
    enableEdit: false
};
