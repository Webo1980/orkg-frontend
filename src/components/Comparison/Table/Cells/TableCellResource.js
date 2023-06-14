import PathTooltipContent from 'components/Comparison/Table/Cells/PathTooltipContent';
import StatementBrowser from 'components/Comparison/Table/Cells/StatementBrowser';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TableCellResource = ({ entity, index }) => {
    const [modal, setModal] = useState(false);

    const onClickHandle = () => {
        setModal(true);
    };

    return (
        <span>
            <DescriptionTooltip
                id={entity.resourceId}
                _class={entity.type}
                classes={entity.classes ?? []}
                extraContent={entity.pathLabels?.length > 1 ? <PathTooltipContent data={entity} cellDataValue={entity} /> : ''}
            >
                <div
                    className="btn-link d-inline-block py-1 px-2"
                    onClick={() => onClickHandle(entity, index)}
                    style={{ cursor: 'pointer' }}
                    onKeyDown={e => (e.keyCode === 13 ? onClickHandle(entity, index) : undefined)}
                    role="button"
                    tabIndex={0}
                >
                    <ValuePlugins type="resource">{entity.label}</ValuePlugins>
                </div>
            </DescriptionTooltip>

            {modal && <StatementBrowser entity={entity} toggle={() => setModal(v => !v)} />}
        </span>
    );
};

TableCellResource.propTypes = {
    entity: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
};

export default TableCellResource;
