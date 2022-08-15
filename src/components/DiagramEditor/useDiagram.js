import { useState, useEffect, useCallback } from 'react';
import createEngine, { DefaultLinkModel, DefaultNodeModel, DiagramModel, DagreEngine } from '@projectstorm/react-diagrams';
import ZoomAction from './actions/ZoomAction';

function useDiagram() {
    const [engine, setEngine] = useState(createEngine({}));
    const [model, setModel] = useState(new DiagramModel());

    useEffect(() => {
        model.setGridSize(15);
        model.setLocked(false);
        const actions = [ZoomAction];
        actions.forEach(Action => engine.getActionEventBus().registerAction(new Action()));
        // 3-A) create a default node
        let node1 = new DefaultNodeModel({
            name: 'Node 1',
            color: 'rgb(0,192,255)',
        });
        node1.setPosition(100, 100);
        let port1 = node1.addOutPort('Out');

        // 3-B) create another default node
        let node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        let port2 = node2.addInPort('In');
        node2.setPosition(400, 100);

        // link the ports
        let link1 = port1.link(port2);
        link1.getOptions().testName = 'Test';
        link1.addLabel('Hello World!');

        // 4) add the models to the root graph
        model.addAll(node1, node2, link1);

        setModel(model);
        setEngine(engine);
    }, []);

    const fireAction = event =>
        engine.getActionEventBus().fireAction({
            event: {
                ...event,
                key: '',
                preventDefault: () => {},
                stopPropagation: () => {},
            },
        });

    const zoomIn = ({ event }) =>
        fireAction({
            clientX: event.clientX,
            clientY: event.clientY,
            type: 'wheel',
            deltaY: +1,
            currentTarget: event.currentTarget,
        });

    const zoomOut = ({ event }) =>
        fireAction({
            clientX: event.clientX,
            clientY: event.clientY,
            type: 'wheel',
            deltaY: -1,
            currentTarget: event.currentTarget,
        });

    const addNode = ({ event }) => {
        const boundingRect = engine.getCanvas().getBoundingClientRect();
        const clientWidth = boundingRect.width;
        const clientHeight = boundingRect.height;

        // Compute mouse coords relative to canvas
        const clientX = event.clientX - boundingRect.left;
        const clientY = event.clientY - boundingRect.top;

        const node = new DefaultNodeModel('New', 'rgb(0,192,255)');
        node.setPosition(clientX, clientY);
        model.addAll(node);
        engine.repaintCanvas();
    };

    engine.setModel(model);

    return { engine, zoomIn, zoomOut, addNode };
}
export default useDiagram;
