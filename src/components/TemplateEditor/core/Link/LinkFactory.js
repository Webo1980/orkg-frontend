import React from 'react';
import { DefaultLinkFactory } from '@projectstorm/react-diagrams-defaults';
import LinkModel from './LinkModel';
import LinkWidget from './LinkWidget';
import styled from 'styled-components';

const Path = styled.path`
    @keyframes stroke-dash {
        from {
            stroke-dashoffset: 24;
        }
        to {
            stroke-dashoffset: 0;
        }
    }

    pointer-events: all;
    stroke-linecap: round;
    fill: none;

    ${props =>
        props.selected &&
        `
            stroke-linecap: butt;
            stroke-dasharray: 10, 2;
        `}
`;

export default class LinkFactory extends DefaultLinkFactory {
    constructor() {
        super('link');
    }

    generateModel() {
        return new LinkModel();
    }

    generateReactWidget(event) {
        return <LinkWidget diagramEngine={this.engine} link={event.model} factory={this} />;
    }

    generateLinkSegment(model, selected, path) {
        return (
            <>
                <Path selected={selected} stroke={model.getColor()} strokeWidth={4} d={path} />
                {/* This path is to facilitate link selection */}
                <Path stroke="none" strokeWidth={25} d={path} />
            </>
        );
    }
}
