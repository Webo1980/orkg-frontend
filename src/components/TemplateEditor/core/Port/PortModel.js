import { PortModel as RDPortModel } from '@projectstorm/react-diagrams';
import { CLASSES } from 'constants/graphSettings';
import LinkModel from '../Link/LinkModel';

export default class PortModel extends RDPortModel {
    constructor(options = {}, configurations) {
        super({
            type: 'Port',
            maximumLinks: 1,
            ...options
        });

        this.input = null;
        this.configurations = configurations;
    }

    serialize() {
        return {
            ...super.serialize(),
            configurations: this.configurations,
            input: this.input
        };
    }

    deserialize(event, engine) {
        super.deserialize(event, engine);
        this.configurations = event.data.configurations;
        this.input = event.data.input;
    }

    updateConfiguration(configurations) {
        this.configurations = configurations;
    }

    getPortLabel() {
        if (this.configurations.valueType) {
            switch (this.configurations.valueType.id) {
                case 'String':
                    return 'S';
                case 'Date':
                    return 'D';
                case 'Number':
                    return 'I';
                default:
                    return 'C';
            }
        } else {
            return '';
        }
    }

    getCardinalityLabel() {
        if (this.configurations.cardinality !== 'range') {
            return this.configurations.cardinality;
        } else {
            return `${this.configurations.minOccurs}..${this.configurations.maxOccurs}`;
        }
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
