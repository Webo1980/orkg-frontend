import { Point } from '@projectstorm/geometry';
import { PointModel, LinkModel as RDLinkModel } from '@projectstorm/react-diagrams';
import { sameAxis } from '../Diagram/states/common';

export default class LinkModel extends RDLinkModel {
    constructor(options) {
        super({
            type: 'link',
            ...options
        });

        this.value = null;
    }

    setSelected(selected) {
        super.setSelected(selected);

        if (this.getSourcePort()) {
            this.getSourcePort().setSelected(selected);
        }
        if (this.getTargetPort()) {
            this.getTargetPort().setSelected(selected);
        }
    }

    serialize() {
        return {
            ...super.serialize(),
            value: this.value
        };
    }

    deserialize(event) {
        super.deserialize(event);
        const { registerModel } = event;
        registerModel(this);
        requestAnimationFrame(() => {
            this.points = event.data.points.map(
                point =>
                    new PointModel({
                        link: this,
                        position: new Point(point.x, point.y)
                    })
            );
            event.engine.repaintCanvas();
        });
    }

    addPoint(pointModel, index = 1) {
        super.addPoint(pointModel, index);
        return pointModel;
    }

    getMiddlePoint() {
        if (!this.hasMiddlePoint()) {
            return null;
        }
        return this.getPoints()[1];
    }

    getSecondPoint() {
        return this.getPoints()[1];
    }

    getSecondLastPoint() {
        const points = this.getPoints();
        return points[points.length - 2];
    }

    getFirstPosition() {
        return this.getFirstPoint().getPosition();
    }

    getSecondPosition() {
        return this.getSecondPoint().getPosition();
    }

    getMiddlePosition() {
        if (!this.hasMiddlePoint()) {
            return null;
        }

        return this.getMiddlePoint().getPosition();
    }

    getSecondLastPosition() {
        return this.getSecondLastPoint().getPosition();
    }

    getLastPosition() {
        return this.getLastPoint().getPosition();
    }

    hasMiddlePoint() {
        return this.getPoints().length === 3;
    }

    isStraight() {
        if (!this.hasMiddlePoint()) {
            return true;
        }

        const first = this.getFirstPosition();
        const middle = this.getMiddlePosition();
        const last = this.getLastPosition();

        if (sameAxis(first, middle, last)) {
            return true;
        }

        return false;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }

    getColor() {
        if (this.isSelected()) {
            return 'var(--link-selected)';
        }

        return 'var(--link-unselected)';
    }
}
