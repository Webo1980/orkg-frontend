import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faEye, faSave, faExpandArrowsAlt, faSitemap } from '@fortawesome/free-solid-svg-icons';
import EditorTour from 'components/TemplateEditor/EditorTour/EditorTour';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';

const ToolbarStyled = styled.div`
    background: ${props => props.theme.darkblue};
    position: fixed;
    width: 100%;
    top: 72px;
    padding: 10px 7px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.13);
    z-index: 1;
    display: flex;
    align-items: center;
`;

const Toolbar = props => {
    return (
        <ToolbarStyled>
            <h1 className="h5 mb-0 ml-2" style={{ color: '#fff', height: 'auto' }}>
                Template editor
            </h1>
            <Tippy content="Get a guided tour">
                <span className="ml-3">
                    <Button
                        color="link"
                        outline
                        size="sm"
                        style={{ fontSize: 22, lineHeight: 1, color: '#fff' }}
                        className="p-0"
                        onClick={props.toggleTourOpen}
                    >
                        <Icon icon={faQuestionCircle} />
                    </Button>
                </span>
            </Tippy>
            <div className="ml-auto" id="templateEditorButtons">
                <ButtonGroup className="mr-2">
                    <Tippy content="Zoom to fit">
                        <span className="ml-3">
                            <Button id="templateEditorFitZoom" color="darkblueDarker" size="sm" onClick={() => props.zoomToFitNodes()}>
                                <Icon icon={faExpandArrowsAlt} />
                            </Button>
                        </span>
                    </Tippy>
                    <Tippy content="Reorganize">
                        <span className="ml-3">
                            <Button id="templateEditReorganize" color="darkblueDarker" size="sm" onClick={() => props.autoDistribute()}>
                                <Icon icon={faSitemap} />
                            </Button>
                        </span>
                    </Tippy>
                </ButtonGroup>
                <ButtonGroup className="mr-2">
                    <Button disabled id="previewButton" color="darkblueDarker" size="sm" onClick={() => null}>
                        <Icon icon={faEye} /> Preview
                    </Button>
                    <Button id="saveButton" color="primary" size="sm" onClick={() => props.handleClickSave()}>
                        <Icon icon={faSave} /> Save
                    </Button>
                </ButtonGroup>
            </div>

            <EditorTour isOpen={props.isTourOpen} setIsTourOpen={props.toggleTourOpen} />
        </ToolbarStyled>
    );
};

Toolbar.propTypes = {
    isTourOpen: PropTypes.bool.isRequired,
    toggleTourOpen: PropTypes.func.isRequired,
    zoomToFitNodes: PropTypes.func.isRequired,
    handleClickSave: PropTypes.func.isRequired,
    autoDistribute: PropTypes.func.isRequired
};

export default Toolbar;
