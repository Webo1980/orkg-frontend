import { BaseModel } from 'components/TemplateEditor/core';

export default class NodeShapeModel extends BaseModel {
    initialize(configurations) {
        this.id = configurations.id;
        this.label = configurations.label;
        this.description = configurations.description;
        this.targetClass = configurations.targetClass;
        this.predicate = configurations.predicate;
        this.researchFields = configurations.researchFields;
        this.researchProblems = configurations.researchProblems;
        this.closed = configurations.closed ?? false;
        this.addInputPort('TargetClass');
    }

    toggleClosed() {
        this.closed = !this.closed;
    }

    getIsClosed() {
        return this.closed;
    }

    onClick() {
        //this.emit({ out: 1 });
    }

    onRelease() {
        //this.emit({ out: 0 });
    }
}
