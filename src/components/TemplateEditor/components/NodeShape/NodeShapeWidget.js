import React from 'react';
import { Port } from 'components/TemplateEditor/core';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faCog, faLock, faLockOpen, faTrash, faFont } from '@fortawesome/free-solid-svg-icons';
import { Shape, Title, StyledAddProperty, PropertyItem } from 'components/TemplateEditor/styled';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';

const NodeShapeWidget = props => {
    const { model, engine } = props;
    const outputPorts = Object.values(model.getOutputPorts()); // Properties
    const {
        options: { selected },
        closed
    } = model;

    return (
        <Shape selected={selected}>
            <div>
                <Title>
                    <div className="flex-grow-1">
                        <ConditionalWrapper
                            condition={model.label.length > 40}
                            wrapper={children => (
                                <Tippy content={model.label}>
                                    <span>{children}</span>
                                </Tippy>
                            )}
                        >
                            {truncate(model.label, {
                                length: 40
                            })}
                        </ConditionalWrapper>
                    </div>
                    <div className="option justify-content-end">
                        <Tippy content="Template settings">
                            <span>
                                <Button
                                    className="p-0"
                                    size="sm"
                                    color="link"
                                    style={{ color: '#fff' }}
                                    onClick={e => {
                                        props.engine.showComponentModal(props.model, 'editShape');
                                    }}
                                >
                                    <Icon icon={faCog} />
                                </Button>
                            </span>
                        </Tippy>
                    </div>
                    <div className="ml-2">
                        <Tippy content="Formatted label settings">
                            <span>
                                <Button
                                    className="p-0"
                                    size="sm"
                                    color="link"
                                    style={{ color: '#fff' }}
                                    onClick={e => {
                                        props.engine.showComponentModal(props.model, 'formattedLabel');
                                    }}
                                >
                                    <Icon icon={faFont} />
                                </Button>
                            </span>
                        </Tippy>
                    </div>
                    <div className="ml-2 justify-content-end">
                        <Port name="TargetClass" model={model} port={model.getPort('TargetClass')} engine={engine}>
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
                        </Port>
                    </div>
                </Title>
                {outputPorts.map((port, i) => (
                    <PropertyItem key={port.getName()}>
                        <div className="flex-grow-1">
                            <ConditionalWrapper
                                condition={port.configurations.label.length > 40}
                                wrapper={children => (
                                    <Tippy content={port.configurations.label}>
                                        <span>{children}</span>
                                    </Tippy>
                                )}
                            >
                                {truncate(port.configurations.label, {
                                    length: 40
                                })}
                            </ConditionalWrapper>
                        </div>
                        <div className="option ml-2 mr-2">
                            <Button
                                className="p-0"
                                size="sm"
                                color="link"
                                onClick={() => {
                                    props.engine.showComponentModal(port);
                                }}
                            >
                                <Icon icon={faPen} />
                            </Button>
                        </div>
                        <div className="option mr-2">
                            <Button
                                className="p-0"
                                size="sm"
                                color="link"
                                onClick={() => {
                                    model.removePort(port);
                                    engine.clearSelectionAndRepaint(model);
                                }}
                            >
                                <Icon icon={faTrash} />
                            </Button>
                        </div>
                        <div className="justify-content-end mr-2">{port.getCardinalityLabel()}</div>
                        <Port key={port.getName()} name={port.getName()} model={model} port={port} engine={engine}>
                            {port.configurations.valueType && (
                                <Tippy content={`Value type: ${port.configurations.valueType.label}`}>
                                    <div className="justify-content-end">{port.getPortLabel()}</div>
                                </Tippy>
                            )}
                            {!port.configurations.valueType && <div className="justify-content-end">{port.getPortLabel()}</div>}
                        </Port>
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
                                props.engine.showComponentModal(props.model, 'addPort');
                            }}
                        >
                            Add property
                        </StyledAddProperty>
                        <Tippy content={closed ? 'Mark this template as open' : 'Mark this template as closed'} placement="bottom">
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
