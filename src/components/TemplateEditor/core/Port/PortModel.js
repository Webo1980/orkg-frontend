import { PortModel as RDPortModel } from '@projectstorm/react-diagrams';
import LinkModel from '../Link/LinkModel';

export default class PortModel extends RDPortModel {
    constructor(options = {}) {
        super({
            type: 'Port',
            maximumLinks: 1,
            ...options
        });

        this.input = null;
    }

    serialize() {
        return {
            ...super.serialize(),
            input: this.input
        };
    }

    deserialize(event, engine) {
        super.deserialize(event, engine);
        this.input = event.data.input;
    }

    setAsInput() {
        this.input = true;
    }

    setAsOutput() {
        this.input = false;
    }

    isInput() {
        return this.input === true;
    }

    isOutput() {
        return this.input === false;
    }

    isNewLinkAllowed() {
        return Object.keys(this.getLinks()).length < this.getMaximumLinks();
    }

    canLinkToPort(port) {
        return port.isNewLinkAllowed() && this.getID() !== port.getID();
    }

    createLinkModel() {
        if (this.isNewLinkAllowed()) {
            const link = new LinkModel();
            return link;
        }
        return null;
    }

    getMainLink() {
        const links = Object.values(this.getLinks());
        return links.length > 0 ? links[0] : null;
    }

    getColor() {
        const link = this.getMainLink();
        if (link) {
            return link.getColor();
        }
        return 'var(--port-unconnected)';
    }

    getTextColor() {
        const link = this.getMainLink();
        if (link) {
            return link.isSelected() ? 'var(--port-unconnected-text)' : 'var(--port-connected-unselected-text)';
        }
        return 'var(--port-unconnected-text)';
    }
}
