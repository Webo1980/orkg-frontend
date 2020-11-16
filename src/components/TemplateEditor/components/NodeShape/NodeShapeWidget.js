import React from 'react';
import { Port } from 'components/TemplateEditor/core';
import { Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';

const PositionedPort = styled(Port)``;

export const Shape = styled.div`
    position: relative;
    background: ${props => (props.selected ? 'var(--body-selected)' : 'var(--body-unselected)')};
    border: 2px solid ${props => (props.selected ? 'var(--border-selected)' : 'var(--border-unselected)')};
    transition: 100ms linear;
    border-radius: 4px;
    font-size: 11px;
    min-width: 200px;
`;

const Title = styled.div`
    background: ${props => props.theme.darkblue};
    display: flex;
    white-space: nowrap;
    justify-items: center;
    padding: 5px 5px;
    flex-grow: 1;
    font-size: 12px;
    color: white;
    .option {
        visibility: hidden;
        cursor: pointer;
    }
    :hover {
        .option {
            visibility: visible;
        }
    }
`;

export const StyledAddProperty = styled(Button)`
    border-radius: 0 !important;
    border-width: 1px 0 0 0 !important;
    &:first-child,
    &:first-child:hover {
        border-width: 1px 0 0 0 !important;
        border-radius: 0 !important;
    }
    &:last-child,
    &:last-child:hover {
        border-width: 1px 0 0 1px !important;
        border-radius: 0 !important;
    }
    font-size: 11px;
    flex-grow: 1;
`;

const PropertyItem = styled.div`
    padding: 4px;
    display: flex;
    .option {
        visibility: hidden;
        cursor: pointer;
    }
    :hover {
        background: #fff;
        .option {
            visibility: visible;
        }
    }
`;

const NodeShapeWidget = props => {
    const { model, engine } = props;
    const outputPorts = Object.values(model.getOutputPorts());
    const {
        options: { selected },
        closed
    } = model;

    return (
        <Shape selected={selected}>
            <div>
                <Title>
                    <div className="flex-grow-1">{model.label} </div>
                    <div className="option justify-content-end">
                        <div onClick={() => alert('Edit Shape')}>
                            <Icon icon={faPen} />
                        </div>
                    </div>
                    <div className="ml-2 justify-content-end">
                        <PositionedPort name="TargetClass" model={model} port={model.getPort('TargetClass')} engine={engine}>
                            {model.targetClass && (
                                <Tippy content={`Target class: ${model.targetClass.label}`}>
                                    <span>C</span>
                                </Tippy>
                            )}
                            {!model.targetClass && (
                                <Tippy content="Target class: Generated class">
                                    <span>C</span>
                                </Tippy>
                            )}
                        </PositionedPort>
                    </div>
                </Title>
                {outputPorts.map((port, i) => (
                    <PropertyItem key={port.getName()}>
                        <div className="flex-grow-1">{port.getName()}</div>
                        <div className="justify-content-end ml-2 mr-2">1..*</div>
                        <div className="option mr-2">
                            <div onClick={() => alert('Edit property')}>
                                <Icon icon={faPen} />
                            </div>
                        </div>
                        <PositionedPort key={port.getName()} name={port.getName()} model={model} port={port} engine={engine}>
                            <div className="justify-content-end">S</div>
                        </PositionedPort>
                    </PropertyItem>
                ))}
                <div className="d-flex">
                    <ButtonGroup className="flex-grow-1">
                        <StyledAddProperty
                            className="flex-grow-1"
                            size="sm"
                            outline
                            color="danger"
                            onClick={e => {
                                props.engine.showAddProperty(props.model);
                            }}
                        >
                            Add property
                        </StyledAddProperty>
                        <Tippy content={closed ? 'Mark this shape as open' : 'Mark this shape as closed'} placement="bottom">
                            <span>
                                <StyledAddProperty
                                    style={{ width: '70px' }}
                                    onClick={e => {
                                        model.toggleClosed();
                                        engine.clearSelectionAndRepaint(model);
                                    }}
                                    outline
                                    size="sm"
                                    className="flex-grow-0"
                                >
                                    {closed && <Icon icon={faLock} />}
                                    {!closed && <Icon icon={faLockOpen} />}
                                </StyledAddProperty>
                            </span>
                        </Tippy>
                    </ButtonGroup>
                </div>
            </div>
        </Shape>
    );
};

NodeShapeWidget.propTypes = {
    model: PropTypes.object.isRequired,
    engine: PropTypes.object.isRequired
};

export default NodeShapeWidget;
