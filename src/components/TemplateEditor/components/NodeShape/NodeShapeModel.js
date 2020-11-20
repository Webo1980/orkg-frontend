import { BaseModel } from 'components/TemplateEditor/core';

export default class NodeShapeModel extends BaseModel {
    initialize(configurations) {
        if (configurations.id) {
            this.id = configurations.id;
        }
        this.label = configurations.label;
        this.description = configurations.description;
        this.targetClass = configurations.targetClass;
        this.predicate = configurations.predicate;
        this.researchFields = configurations.researchFields;
        this.researchProblems = configurations.researchProblems;
        this.closed = configurations.closed ?? false;
        this.addInputPort('TargetClass');
    }

    updateConfiguration(configurations) {
        if (configurations.id) {
            this.id = configurations.id;
        }
        this.label = configurations.label;
        this.description = configurations.description;
        this.targetClass = configurations.targetClass;
        this.predicate = configurations.predicate;
        this.researchFields = configurations.researchFields;
        this.researchProblems = configurations.researchProblems;
    }

    serialize() {
        return {
            ...super.serialize(),
            label: this.label,
            description: this.description,
            targetClass: this.targetClass,
            predicate: this.predicate,
            researchFields: this.researchFields,
            researchProblems: this.researchProblems,
            closed: this.closed
        };
    }

    deserialize(event, engine) {
        super.deserialize(event, engine);
        this.label = event.data.label;
        this.description = event.data.description;
        this.targetClass = event.data.targetClass;
        this.predicate = event.data.predicate;
        this.researchFields = event.data.researchFields;
        this.researchProblems = event.data.researchProblems;
        this.closed = event.closed;
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
