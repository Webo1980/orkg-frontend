import React from 'react';
import { MenuProvider } from 'react-contexify';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export default class Component extends AbstractReactFactory {
    constructor({ type, name, configurations = [], model, widget }) {
        super(type);
        this.name = name;
        this.configurations = configurations;
        this.Model = model;
        this.Widget = widget;
    }

    generateReactWidget(event) {
        const { Widget } = this;
        const { model } = event;

        return (
            <MenuProvider id="component" storeRef={false} data={model}>
                <Widget engine={this.engine} model={model} />
            </MenuProvider>
        );
    }

    generateModel(event) {
        const { Model } = this;
        const { configurations, type } = event.initialConfig;

        return new Model(configurations, type);
    }
}
