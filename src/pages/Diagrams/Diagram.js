import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from 'reactstrap';
import CanvasWidget from 'components/DiagramEditor/CanvasWidget';
import useDiagram from 'components/DiagramEditor/useDiagram';

function Diagram(props) {
    const location = useLocation();
    const { id } = useParams();
    // 1) setup the diagram engine
    const { engine, zoomIn, zoomOut, addNode } = useDiagram();

    return (
        <Container className="p-2 box rounded" style={{ width: '100%', height: '500px' }}>
            <CanvasWidget engine={engine} actions={{ zoomIn, zoomOut, addNode }} />
        </Container>
    );
}

export default Diagram;
