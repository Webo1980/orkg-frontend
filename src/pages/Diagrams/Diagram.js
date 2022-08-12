import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from 'reactstrap';
import createEngine, { DefaultLinkModel, DefaultNodeModel, DiagramModel } from '@projectstorm/react-diagrams';
import styled from 'styled-components';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

const FullscreenCanvas = styled(CanvasWidget)`
    height: 100%;
    width: 100%;
    border: 1px solid #ccc;
`;

function Diagram(props) {
    const location = useLocation();
    const { id } = useParams();
    // create an instance of the engine with all the defaults
    const engine = createEngine();
    useEffect(() => {
        const getDiagram = async () => {};
        getDiagram();
    }, [location, id]);

    // node 1
    const node1 = new DefaultNodeModel({
        name: 'Node 1',
        color: 'rgb(0,192,255)',
    });
    node1.setPosition(100, 100);
    let port1 = node1.addOutPort('Out');

    // node 2
    const node2 = new DefaultNodeModel({
        name: 'Node 2',
        color: 'rgb(0,192,255)',
    });
    node2.setPosition(100, 300);
    let port2 = node2.addOutPort('Out');

    // link them and add a label to the link
    const link = port1.link(port2);
    // link.addLabel('Hello World!');

    const model = new DiagramModel();
    model.addAll(node1, node2, link);
    engine.setModel(model);

    return (
        <Container className="p-2 box rounded" style={{ width: '100%', height: '500px' }}>
            <FullscreenCanvas engine={engine} />
        </Container>
    );
}

export default Diagram;
