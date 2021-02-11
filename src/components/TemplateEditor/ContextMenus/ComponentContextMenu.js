import React from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import PropTypes from 'prop-types';

const ComponentContextMenu = ({
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
    <Menu id="component">
        {/*
        <Item onClick={duplicateSelected}>Duplicate</Item>

        <Item onClick={cutSelected}>Cut</Item>

        <Item onClick={copySelected}>Copy</Item>

        <Item onClick={pasteSelected}>Paste</Item>
        */}
        <Item onClick={deleteSelected}>Delete</Item>

        <Separator />

        <Item onClick={zoomIn}>Zoom in</Item>

        <Item onClick={zoomOut}>Zoom out</Item>

        <Separator />
        {/*
        <Item onClick={undo}>Undo</Item>

        <Item onClick={redo}>Redo</Item>

        <Separator />
        */}
        <Item onClick={({ props: component }) => configureComponent(component)}>Edit configurations...</Item>
    </Menu>
);

ComponentContextMenu.propTypes = {
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

export default ComponentContextMenu;
