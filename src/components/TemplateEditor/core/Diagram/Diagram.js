import React from 'react';
import { MenuProvider } from 'react-contexify';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import DroppableLayer from './DroppableLayer';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const FullscreenCanvas = styled(CanvasWidget)`
    height: 100%;
    width: 100%;
`;

const Diagram = ({ engine }) => (
    <MenuProvider className="d-flex flex-grow-1" id="diagram" storeRef={false} data={{ test: 1 }}>
        <DroppableLayer handleComponentDrop={(...args) => engine.handleComponentDrop(...args)} disabled={engine.isLocked()}>
            <FullscreenCanvas engine={engine.getEngine()} />
        </DroppableLayer>
    </MenuProvider>
);

Diagram.propTypes = {
    engine: PropTypes.object.isRequired
};
export default Diagram;
