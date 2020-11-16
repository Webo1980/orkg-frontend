import React from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import PropTypes from 'prop-types';

const DiagramContextMenu = ({ pasteSelected, undo, redo, zoomIn, zoomOut }) => (
    <Menu id="diagram">
        <Item onClick={pasteSelected}>Paste</Item>

        <Separator />

        <Item onClick={zoomIn}>Zoom in</Item>
        <Item onClick={zoomOut}>Zoom out</Item>

        <Separator />

        <Item onClick={undo}>Undo</Item>

        <Item onClick={redo}>Redo</Item>
    </Menu>
);

DiagramContextMenu.propTypes = {
    pasteSelected: PropTypes.func.isRequired,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired
};

export default DiagramContextMenu;
