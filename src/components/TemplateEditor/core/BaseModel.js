import { Point } from '@projectstorm/geometry';
import { NodeModel } from '@projectstorm/react-diagrams';
import PortModel from './Port/PortModel';
import components from 'components/TemplateEditor/components';
import { getTemplateById, getTemplatesByClass } from 'services/backend/statements';
import { convertToRange } from 'utils';
import uniqBy from 'lodash/uniqBy';

const getPort = (port, configurations = null) => {
    if (port instanceof PortModel) {
        return port;
    }
    return new PortModel({ name: port }, configurations);
};

export default class BaseModel extends NodeModel {
    constructor(configurations = {}, type = 'generic') {
        // If no id is specified the NodeModel will generate one
        super({ ...(configurations.id ? { id: configurations.id } : {}), type });

        this.initialize(configurations);

        //this.configurations = configurations;
    }

    serialize() {
        return {
            ...super.serialize(),
            label: this.label
            //configurations: this.configurations
        };
    }

    addInputPort(arg, configurations) {
        const port = getPort(arg, configurations);
        port.setAsInput();
        super.addPort(port);
    }

    addOutputPort(arg, configurations, loadTemplate = false) {
        const port = getPort(arg, configurations);
        port.setAsOutput();
        super.addPort(port);
        if (loadTemplate) {
            // load the template
            console.log('load the template');
            console.log(configurations.valueType);
            //this.loadTemplateByClassID(configurations.valueType.id);
            /*
            // loadTemplateByClassID()
            console.log(this);
            console.log(this.parent.parent);
            const point = new Point(100, 100);
            const component = {
                type: 'NodeShape',
                configurations: {
                    id: 'asdasd',
                    label: 'dasdasd',
                    targetClass: null,
                    researchFields: [],
                    researchProblems: [],
                    predicate: null,
                    closed: false,
                    hasLabelFormat: false,
                    labelFormat: ''
                }
            };
            const { Model } = components.find(c => c.type === component.type);
            const node = new Model(component.configurations, component.type);
            node.setPosition(point);
            this.parent.parent.addNode(node);
            */
        }
    }

    /**
     * Load template by Class
     *
     * @param {String} classID string
     * @param {Array} links end Char count
     */
    loadTemplateByClassID = (classID, links) => {
        return getTemplatesByClass(classID).then(templateIds => {
            if (templateIds[0]) {
                return this.loadTemplateByID(templateIds[0], links);
            } else {
                return Promise.resolve();
            }
        });
    };

    /**
     * Component creation and configuration methods
     */
    handleComponentDrop = (event, component) => {
        const { Model } = components.find(c => c.type === component.type);

        const getSnappedRelativeMousePoint = () => {
            const { x, y } = this.parent.getRelativeMousePoint(event);
            return new Point(Math.round(x / 15) * 15, Math.round(y / 15) * 15);
        };

        const point = event ? getSnappedRelativeMousePoint(event) : new Point(100, 100);

        const node = new Model(component.configurations, component.type);
        this.parent.parent.addNode(node);
        node.setPosition(point);

        this.parent.fireEvent({ nodes: [node] }, 'componentsAdded');

        // this.parent.repaintCanvas();
    };

    /**
     * Load template by ID
     *
     * @param {String} templateID template ID
     * @param {Array} links List of links {fromNode: Node, fromPort: Port, to: Class}
     */
    loadTemplateByID = (templateID, links = []) => {
        return getTemplateById(templateID).then(t => {
            let node = this.parent.parent.getNode(t.id);
            // Check if the template already loaded
            if (!node) {
                this.handleComponentDrop(null, {
                    type: 'NodeShape',
                    configurations: {
                        id: t.id,
                        label: t.label,
                        targetClass: t.class,
                        researchFields: t.researchFields,
                        researchProblems: t.researchProblems,
                        predicate: t.predicate,
                        closed: t.isStrict,
                        hasLabelFormat: t.hasLabelFormat,
                        labelFormat: t.labelFormat
                    }
                });
                node = this.parent.parent.getNode(t.id);
                // add properties (components)
                const classes2load = [];
                for (const component of t.components) {
                    // If there is a range add the class to load and the link to add
                    if (component.value) {
                        classes2load.push(component.value);
                        links.push({ fromNode: node, fromPort: component.property.id, to: component.value });
                    }
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
                this.addLinksLinksOfNode(links, node);
                return Promise.all(
                    uniqBy(classes2load, 'id')
                        .filter(c => c.id)
                        .map(class2load => this.loadTemplateByClassID(class2load.id, links))
                );
            }
            // Add the links
            this.addLinksLinksOfNode(links, node);

            return Promise.resolve();
        });
    };

    /**
     * Adding the link of a node
     *
     * @param {Array} links List of links {fromNode: Node, fromPort: Port, to: Class}
     * @param {Object} node Focus node
     */
    addLinksLinksOfNode = (links, node) => {
        links
            .filter(link => link.to.id === node.targetClass.id)
            .forEach(link => {
                // get class port
                const classPort = node.getPort('TargetClass');
                //get port
                const port = link.fromNode.getPort(link.fromPort);
                // check if the link is already created
                const existingLinks = Object.values(port.getLinks()).filter(link => {
                    return link.getTargetPort().getID() === classPort.getID();
                });
                if (existingLinks.length === 0) {
                    const newLink = port.createLinkModel();
                    newLink.setSourcePort(port);
                    newLink.setTargetPort(classPort);
                    port.reportPosition();
                    classPort.reportPosition();
                    this.parent.parent.addLink(newLink);
                    //this.parent.repaintCanvas();
                }
            });
    };

    addPort(arg) {
        const port = getPort(arg);

        if (port.isInput()) {
            this.addInputPort(port);
            return;
        }

        if (port.isOutput()) {
            this.addOutputPort(port);
            return;
        }
    }

    removePort(arg) {
        const port = getPort(arg);
        super.removePort(port);
    }

    getInputPorts() {
        return Object.fromEntries(Object.entries(this.getPorts()).filter(([, port]) => port.isInput()));
    }

    getOutputPorts() {
        return Object.fromEntries(Object.entries(this.getPorts()).filter(([, port]) => !port.isInput()));
    }

    getAllLinks() {
        return Object.values(this.getPorts())
            .map(port => port.getMainLink())
            .filter(link => !!link)
            .reduce((arr, link) => [...arr, link], []);
    }

    clone(...args) {
        const clone = super.clone(...args);
        clone.setPosition(new Point(this.getX() + 15, this.getY() + 15));
        return clone;
    }

    initialize() {}

    emit(value) {
        //  emit(this.getID(), value);
    }
}
