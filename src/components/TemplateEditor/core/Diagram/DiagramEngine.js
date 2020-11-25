/*
    Some part of this DiagramEngine was copied and extended from this code by Renato Böhler:
    https://renato-bohler.github.io/logossim/
*/
import { Point, Polygon, Rectangle } from '@projectstorm/geometry';
import createEngine, { DiagramModel, DagreEngine } from '@projectstorm/react-diagrams';
import BaseModel from '../BaseModel';
import LinkFactory from '../Link/LinkFactory';
import PortFactory from '../Port/PortFactory';
import ClipboardAction from './actions/ClipboardAction';
import DeleteAction from './actions/DeleteAction';
import DuplicateAction from './actions/DuplicateAction';
import UndoRedoAction from './actions/UndoRedoAction';
import ZoomAction from './actions/ZoomAction';
import { getTemplateById } from 'services/backend/statements';
import { convertToRange } from 'utils';
import commandHandlers from './Command/commandHandlers';
import CommandManager from './Command/CommandManager';
import States from './states/States';

export default class DiagramEngine {
    constructor(components, areShortcutsAllowed, showComponentModal) {
        this.components = components;
        this.areShortcutsAllowed = areShortcutsAllowed;
        this.showComponentModal = showComponentModal;
        this.locked = false;

        this.initializeEngine();
        this.initializeModel();
    }

    getEngine = () => this.engine;

    getModel = () => this.engine.getModel();

    /**
     * Initialization methods
     */
    initializeEngine = () => {
        this.engine = createEngine({
            registerDefaultDeleteItemsAction: false,
            registerDefaultZoomCanvasAction: false
        });

        this.dagreEngine = new DagreEngine({
            graph: {
                rankdir: 'TB',
                ranker: 'network-simplex',
                marginx: 25,
                marginy: 25
            },
            includeLinks: true
        });

        this.engine.commands = new CommandManager();
        this.engine.registerListener(commandHandlers(this));

        this.engine.getStateMachine().pushState(new States());

        this.engine.showComponentModal = this.showComponentModal;

        this.engine.clearSelectionAndRepaint = this.clearSelectionAndRepaint;

        const actions = [DuplicateAction, ClipboardAction, DeleteAction, UndoRedoAction, ZoomAction];
        actions.forEach(Action => this.engine.getActionEventBus().registerAction(new Action(this.areShortcutsAllowed)));

        this.engine.getPortFactories().registerFactory(new PortFactory());
        this.engine.getLinkFactories().registerFactory(new LinkFactory());

        this.registerComponents();
    };

    initializeModel = () => {
        this.model = new DiagramModel();

        this.model.setGridSize(15);
        this.model.setLocked(false);
        this.model.registerListener({
            eventDidFire: event => {
                const type = event.function;
                if (type === 'offsetUpdated') {
                    this.adjustGridOffset(event);
                }
                if (type === 'zoomUpdated') {
                    this.adjustGridZoom(event);
                }
            }
        });
        this.realignGrid();

        this.engine.setModel(this.model);
    };

    registerComponents = () => {
        this.components.forEach(component => {
            this.engine.getNodeFactories().registerFactory(component);
        });
    };

    /**
     * Serializing & deserializing methods
     */
    serialize = () => this.model.serialize();

    load = template => {
        this.engine.commands.clear();
        this.model.deserializeModel(template, this.engine);
        this.realignGrid();
        this.engine.repaintCanvas();
    };

    /**
     * Load template from the database
     */
    loadTemplate = id => {
        // load template
        return getTemplateById(id).then(template => {
            this.engine.commands.clear();
            // Clear shape
            this.handleComponentDrop(null, {
                type: 'NodeShape',
                configurations: {
                    id: template.id,
                    label: template.label,
                    targetClass: template.class,
                    researchFields: template.researchFields,
                    researchProblems: template.researchProblems,
                    predicate: template.predicate
                }
            });

            const node = this.engine.getModel().getNode(template.id);
            // add properties (components)
            for (const component of template.components) {
                node.addOutputPort(component.property.id, {
                    id: component.property.id,
                    label: component.property.label,
                    property: component.property,
                    valueType: component.value,
                    cardinality: component.cardinality ?? convertToRange(component.minOccurs, component.maxOccurs),
                    minOccurs: component.minOccurs,
                    maxOccurs: component.maxOccurs,
                    validationRules: component.validationRules
                });
            }
            this.realignGrid();
            this.engine.repaintCanvas();
        });
    };

    /**
     * Diagram locking methods
     */
    setLocked = locked => {
        this.model.setLocked(locked);
        this.locked = locked;
    };

    isLocked = () => this.locked;

    /**
     * Diagram painting methods
     */
    repaint = () => {
        this.engine.repaintCanvas();
    };

    clearSelectionAndRepaint = model => {
        //this.clearSelection();
        this.engine.getModel().clearSelection();
        console.log('clearSelectionAndRepaint');
        this.engine.repaintCanvas(true);
    };

    realignGrid = () => {
        this.adjustGridOffset({
            offsetX: this.model.getOffsetX(),
            offsetY: this.model.getOffsetY()
        });

        this.adjustGridZoom({
            zoom: this.model.getZoomLevel()
        });
    };

    adjustGridOffset = ({ offsetX, offsetY }) => {
        document.body.style.setProperty('--offset-x', `${offsetX}px`);
        document.body.style.setProperty('--offset-y', `${offsetY}px`);
    };

    adjustGridZoom = ({ zoom }) => {
        const { gridSize } = this.model.getOptions();
        document.body.style.setProperty('--grid-size', `${(gridSize * zoom) / 100}px`);
    };

    /**
     * Component creation and configuration methods
     */
    handleComponentDrop = (event, component) => {
        const { Model } = this.components.find(c => c.type === component.type);

        const getSnappedRelativeMousePoint = () => {
            const { x, y } = this.engine.getRelativeMousePoint(event);
            return new Point(Math.round(x / 15) * 15, Math.round(y / 15) * 15);
        };

        const point = event ? getSnappedRelativeMousePoint(event) : new Point(100, 100);

        const node = new Model(component.configurations, component.type);
        this.model.addNode(node);
        node.setPosition(point);

        this.engine.fireEvent({ nodes: [node] }, 'componentsAdded');

        this.engine.repaintCanvas();
    };

    handleComponentEdit = (node, configurations) => {
        const configurationsBefore = node.configurations;
        const linksBefore = node.getAllLinks();

        this.editComponentConfiguration(node, configurations);

        this.engine.fireEvent(
            {
                node,
                configurations: {
                    before: configurationsBefore,
                    after: node.configurations
                },
                links: {
                    before: linksBefore,
                    after: node.getAllLinks()
                }
            },
            'componentEdited'
        );

        this.engine.repaintCanvas();
    };

    /**
     * When the component configuration is changed, we reinitialize the
     * given component with the given configurations.
     *
     * For simplicity's sake, if this configuration edit creates or
     * removes a port, we delete all its links. Also, if the number of
     * bits of a port is changed, its main link is deleted.
     */
    editComponentConfiguration = (node, configurations) => {
        const portsBefore = node.getPorts();

        // Resets configurations and ports for the node and reinitialize
        node.configurations = configurations; // eslint-disable-line no-param-reassign
        node.ports = {}; // eslint-disable-line no-param-reassign
        node.initialize(configurations);

        const hasNewPort = Object.values(node.getPorts()).some(newPort => !portsBefore[newPort.getName()]);
        const hasRemovedPort = Object.values(portsBefore).some(oldPort => !node.getPort(oldPort.getName()));

        if (hasNewPort || hasRemovedPort) {
            /**
             * If there was any port added or removed, we need to remove all
             * links connected to the edited component.
             */
            Object.values(portsBefore).forEach(port => Object.values(port.getLinks()).forEach(link => link.remove()));
            return;
        }

        /**
         * If no port was neither added or removed, we need to map old
         * port links to new ports
         */
        Object.values(portsBefore).forEach(portBefore => {
            const newPort = node.getPort(portBefore.getName());
            /**
             * If the number of bits for this port has changed, delete its
             * main link, to avoid inconsistencies.
             
            if (portBefore.getBits() !== newPort.getBits()) {
                if (portBefore.getMainLink()) {
                    portBefore.getMainLink().remove();
                }
                return;
            }
            */
            const link = Object.values(portBefore.getLinks())[0];
            if (!link) {
                return;
            }
            newPort.addLink(link);
            if (portBefore === link.getSourcePort()) {
                link.setSourcePort(newPort);
            }
            if (portBefore === link.getTargetPort()) {
                link.setTargetPort(newPort);
            }
            portBefore.remove();
        });
    };

    clearSelection = () =>
        this.getEngine()
            .getModel()
            .clearSelection();

    getSelectedNodes = () =>
        this.engine
            .getModel()
            .getSelectedEntities()
            .filter(entity => entity instanceof BaseModel);

    fireAction = event =>
        this.engine.getActionEventBus().fireAction({
            event: {
                ...event,
                key: '',
                preventDefault: () => {},
                stopPropagation: () => {}
            }
        });

    duplicateSelected = () => this.fireAction({ type: 'keydown', ctrlKey: true, code: 'KeyD' });

    cutSelected = () => this.fireAction({ type: 'keydown', ctrlKey: true, code: 'KeyX' });

    copySelected = () => this.fireAction({ type: 'keydown', ctrlKey: true, code: 'KeyC' });

    pasteSelected = () => this.fireAction({ type: 'keydown', ctrlKey: true, code: 'KeyV' });

    deleteSelected = () => this.fireAction({ type: 'keydown', code: 'Delete' });

    undo = () => this.fireAction({ type: 'keydown', ctrlKey: true, code: 'KeyZ' });

    redo = () =>
        this.fireAction({
            type: 'keydown',
            ctrlKey: true,
            shiftKey: true,
            code: 'KeyZ'
        });

    zoomIn = ({ event }) =>
        this.fireAction({
            clientX: event.clientX,
            clientY: event.clientY,
            type: 'wheel',
            deltaY: +1
        });

    zoomOut = ({ event }) =>
        this.fireAction({
            clientX: event.clientX,
            clientY: event.clientY,
            type: 'wheel',
            deltaY: -1
        });

    /**
     * Get nodes bounding box coordinates with or without margin
     * @returns rectangle points in node layer coordinates
     */
    getBoundingNodesRect = (nodes, margin) => {
        if (nodes) {
            if (nodes.length === 0) {
                return new Rectangle(0, 0, 0, 0);
            }
            const boundingBox = Polygon.boundingBoxFromPolygons(nodes.map(node => node.getBoundingBox()));
            if (margin) {
                return new Rectangle(
                    boundingBox.getTopLeft().x - margin,
                    boundingBox.getTopLeft().y - margin,
                    boundingBox.getWidth() + 2 * margin,
                    boundingBox.getHeight() + 2 * margin
                );
            }
            return boundingBox;
        }
    };

    zoomToFitNodes = margin => {
        let nodesRect; // nodes bounding rectangle
        const selectedNodes = this.model.getSelectedEntities().map(node => node);
        // no node selected
        if (selectedNodes.length === 0) {
            const allNodes = this.model.getSelectionEntities().map(node => node);
            // get nodes bounding box with margin
            nodesRect = this.getBoundingNodesRect(allNodes, margin);
        } else {
            // get nodes bounding box with margin
            nodesRect = this.getBoundingNodesRect(selectedNodes, margin);
        }
        if (nodesRect) {
            // there is something we should zoom on
            const canvasRect = this.engine.canvas.getBoundingClientRect();
            const canvasTopLeftPoint = {
                x: canvasRect.left,
                y: canvasRect.top
            };
            const nodeLayerTopLeftPoint = {
                x: canvasTopLeftPoint.x + this.getModel().getOffsetX(),
                y: canvasTopLeftPoint.y + this.getModel().getOffsetY()
            };
            const xFactor = this.engine.canvas.clientWidth / nodesRect.getWidth();
            const yFactor = this.engine.canvas.clientHeight / nodesRect.getHeight();
            const zoomFactor = xFactor < yFactor ? xFactor : yFactor;
            this.model.setZoomLevel(zoomFactor * 100);
            const nodesRectTopLeftPoint = {
                x: nodeLayerTopLeftPoint.x + nodesRect.getTopLeft().x * zoomFactor,
                y: nodeLayerTopLeftPoint.y + nodesRect.getTopLeft().y * zoomFactor
            };
            this.model.setOffset(
                this.model.getOffsetX() + canvasTopLeftPoint.x - nodesRectTopLeftPoint.x,
                this.model.getOffsetY() + canvasTopLeftPoint.y - nodesRectTopLeftPoint.y
            );
            this.engine.repaintCanvas();
        }
    };

    autoDistribute = () => {
        this.dagreEngine.redistribute(this.model);
        this.engine.repaintCanvas();
    };
}
