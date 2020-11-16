import React from 'react';
import ComponentContextMenu from './ComponentContextMenu';
import DiagramContextMenu from './DiagramContextMenu';
import PropTypes from 'prop-types';
import 'react-contexify/dist/ReactContexify.min.css';

const ContextMenus = ({
    duplicateSelected,
    cutSelected,
    copySelected,
    pasteSelected,
    deleteSelected,
    undo,
    redo,
    zoomIn,
    zoomOut,
    configureComponent
}) => (
    <>
        <DiagramContextMenu pasteSelected={pasteSelected} undo={undo} redo={redo} zoomIn={zoomIn} zoomOut={zoomOut} />
        <ComponentContextMenu
            duplicateSelected={duplicateSelected}
            cutSelected={cutSelected}
            copySelected={copySelected}
            pasteSelected={pasteSelected}
            deleteSelected={deleteSelected}
            undo={undo}
            redo={redo}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            configureComponent={configureComponent}
        />
    </>
);

ContextMenus.propTypes = {
    duplicateSelected: PropTypes.func.isRequired,
    cutSelected: PropTypes.func.isRequired,
    copySelected: PropTypes.func.isRequired,
    pasteSelected: PropTypes.func.isRequired,
    deleteSelected: PropTypes.func.isRequired,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    configureComponent: PropTypes.func.isRequired
};

export default ContextMenus;
