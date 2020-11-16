import { Point } from '@projectstorm/geometry';
import { NodeModel } from '@projectstorm/react-diagrams';
import PortModel from './Port/PortModel';

const getPort = port => {
    if (port instanceof PortModel) {
        return port;
    }
    return new PortModel({ name: port });
};

export default class BaseModel extends NodeModel {
    constructor(configurations = {}, type = 'generic') {
        super({ type });

        this.initialize(configurations);

        this.configurations = configurations;
    }

    serialize() {
        return {
            ...super.serialize(),
            configurations: this.configurations
        };
    }

    addInputPort(arg) {
        const port = getPort(arg);
        port.setAsInput();
        super.addPort(port);
    }

    addOutputPort(arg) {
        const port = getPort(arg);
        port.setAsOutput();
        super.addPort(port);
    }

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
