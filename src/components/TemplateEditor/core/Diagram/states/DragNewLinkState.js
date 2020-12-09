import { AbstractDisplacementState, Action, InputType } from '@projectstorm/react-canvas-core';
import { NodeModel, PortModel } from '@projectstorm/react-diagrams-core';
import { toast } from 'react-toastify';
import handleLinkDrag from './handleLinkDrag';

/**
 * This State is responsible for handling link creation events.
 */
export default class DragNewLinkState extends AbstractDisplacementState {
    constructor() {
        super({ name: 'drag-new-link' });

        this.registerAction(
            new Action({
                type: InputType.MOUSE_DOWN,
                fire: event => {
                    this.moveDirection = undefined;
                    this.hasStartedMoving = false;

                    this.port = this.engine.getMouseElement(event.event);

                    if (!(this.port instanceof PortModel) || this.port.isLocked()) {
                        this.eject();
                        return;
                    }

                    // select the link of this port
                    this.engine.getModel().clearSelection();
                    Object.values(this.port.links).forEach(l => l.setSelected(true));

                    this.link = this.port.createLinkModel();

                    if (!this.link) {
                        this.eject();
                        return;
                    }

                    this.link.setSelected(true);
                    this.link.setSourcePort(this.port);
                    this.engine.getModel().addLink(this.link);
                    this.port.reportPosition();
                }
            })
        );

        this.registerAction(
            new Action({
                type: InputType.MOUSE_UP,
                fire: event => {
                    const model = this.engine.getMouseElement(event.event);

                    // Disallows creation under nodes
                    if (model instanceof NodeModel || !model instanceof PortModel) {
                        this.link.remove();
                        this.engine.repaintCanvas();
                    }

                    // Link connecting to port
                    if (model instanceof PortModel && this.port.canLinkToPort(model)) {
                        // Disallows connecting ports with the same type (input/output)
                        if (this.port.input === model.input) {
                            this.link.remove();
                            this.engine.repaintCanvas();
                            if (this.port.getName() === 'TargetClass') {
                                toast.error(`It's not possible to link a class to another class`);
                            } else {
                                toast.error(`It's not possible to link a property to another property`);
                            }
                            return;
                        }

                        this.link.setTargetPort(model);

                        // update the range of property
                        if (!model.input) {
                            // start from class and end with property
                            model.updateConfiguration({ ...model.configurations, valueType: this.link.getSourcePort().parent.targetClass });
                        } else {
                            // start from a property and end with a class
                            this.link.getSourcePort().updateConfiguration({
                                ...this.link.getSourcePort().configurations,
                                valueType: model.getParent().targetClass
                            });
                        }

                        model.reportPosition();
                        this.engine.repaintCanvas();
                        this.fireEvent();
                        return;
                    } else {
                        this.link.remove();
                        this.engine.repaintCanvas();
                    }
                    this.fireEvent();
                }
            })
        );
    }

    /**
     * Event is fired to be on the command manager, so the user can undo
     * and redo it.
     */
    fireEvent = () => {
        this.engine.fireEvent({ link: this.link }, 'linkAdded');
    };

    /**
     * Updates link's points upon mouse move.
     */
    fireMouseMoved(event) {
        handleLinkDrag.call(this, event, this.link);
    }
}
