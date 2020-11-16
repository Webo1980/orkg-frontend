import React, { Component } from 'react';
import components from 'components/TemplateEditor/components';
import { DiagramEngine, Diagram } from 'components/TemplateEditor/core';
import Toolbar from 'components/TemplateEditor/Toolbar/Toolbar';
import AddNodeShape from 'components/TemplateEditor/AddNodeShape/AddNodeShape';
import AddProperty from 'components/TemplateEditor/AddProperty/AddProperty';
import AddTemplateButton from 'components/TemplateEditor/AddTemplateButton';
import ContextMenus from 'components/TemplateEditor/ContextMenus/ContextMenus';
import { StyledWorkSpace } from 'components/TemplateEditor/styled';

const DIMENSIONS = { width: 180, height: 135 };

export default class TemplateEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isComponentSelectOpen: false,
            isComponentEditOpen: false,
            modelAdd: null,
            componentEdit: null,
            isTourAvailable: false,
            isTourRunning: !JSON.parse(localStorage.getItem('tour-done')),
            templateCreatedAt: null
        };

        this.diagram = new DiagramEngine(components, this.areShortcutsAllowed, this.showAddProperty);
    }

    componentDidMount() {
        window.addEventListener('keydown', this.shortcutHandler);
        window.addEventListener('load', this.loadHandler);
        window.addEventListener('beforeunload', this.unloadHandler);

        this.autoSaveInterval = setInterval(this.autoSave, 15000);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.shortcutHandler);
        window.addEventListener('load', this.loadHandler);
        window.removeEventListener('beforeunload', this.unloadHandler);

        clearInterval(this.autoSaveInterval);
    }

    areShortcutsAllowed = () => {
        const { isComponentSelectOpen, isComponentEditOpen, isTourRunning } = this.state;

        return !(isComponentSelectOpen || isComponentEditOpen || isTourRunning);
    };

    shortcutHandler = event => {
        const { ctrlKey, shiftKey, code } = event;

        if (!this.areShortcutsAllowed()) {
            return;
        }

        // Add component
        if (ctrlKey && code === 'KeyA') {
            event.preventDefault();
            this.showAddComponent();
        }

        // Component configuration
        if (ctrlKey && code === 'KeyE') {
            event.preventDefault();
            const selectedNodes = this.diagram.getSelectedNodes();
            if (selectedNodes.length !== 1) {
                return;
            }
            const node = selectedNodes[0];
            this.showEditComponent(node);
        }

        // Save diagram
        if (ctrlKey && !shiftKey && code === 'KeyS') {
            event.preventDefault();
            this.handleClickSave();
        }

        // Load diagram
        if ((ctrlKey && code === 'KeyL') || (ctrlKey && shiftKey && code === 'KeyS')) {
            event.preventDefault();
            this.handleClickLoad();
        }
    };

    isTemplateEmpty = template => {
        if (!template) {
            return true;
        }

        return Object.keys(template.layers[1].models).length === 0;
    };

    loadFile = file => {
        this.setState({
            templateCreatedAt: file.createdAt
        });
        this.diagram.load(file.template);
    };

    loadHandler = () => {
        const lastSaved = JSON.parse(localStorage.getItem('template-autosave'));

        if (this.isTemplateEmpty(lastSaved?.template)) {
            this.setState({ isTourAvailable: true });
            return;
        }

        const reload = window.confirm('Reload last unsaved template?');
        if (reload) {
            this.loadFile(lastSaved);
        } else {
            this.setState({ isTourAvailable: true });
            localStorage.removeItem('template-autosave');
        }
    };

    shouldWarnUnload = (currentTemplate, lastSavedTemplate) => {
        if (this.isTemplateEmpty(currentTemplate)) {
            return false;
        }

        return JSON.stringify(lastSavedTemplate.layers) !== JSON.stringify(currentTemplate.layers);
    };

    unloadHandler = event => {
        const lastSaved = JSON.parse(localStorage.getItem('last-saved-template'));
        const file = this.generateFile();

        if (this.shouldWarnUnload(file.template, lastSaved.template)) {
            localStorage.setItem('template-autosave', JSON.stringify(file));

            // eslint-disable-next-line no-param-reassign
            event.returnValue = 'You have unsaved changes. Sure you want to leave?';
        }
    };

    generateFile = () => {
        const { templateCreatedAt } = this.state;
        const template = this.diagram.serialize();

        return {
            id: template.id,
            diagramCreatedAt: templateCreatedAt || new Date(),
            updatedAt: new Date(),
            template
        };
    };

    autoSave = () => {
        const file = this.generateFile();

        if (file.template.id === 'tour-template') {
            return;
        }
        if (this.isTemplateEmpty(file.template)) {
            return;
        }

        localStorage.setItem('template-autosave', JSON.stringify(file));
    };

    handleClickSave = () => {
        const { templateCreatedAt } = this.state;
        if (!templateCreatedAt) {
            this.setState({ templateCreatedAt: new Date() });
        }

        const file = JSON.stringify(this.generateFile(), null, 2);

        localStorage.setItem('last-saved-template', file);

        console.log(file);
        //FileSaver.saveAs(blob, `${filename}.lgsim`);
    };

    handleClickLoad = () => document.getElementById('file-input').click();

    handleFileLoad = event => {
        const {
            target: { files }
        } = event;

        if (files.length !== 1) {
            return;
        }

        const handleError = () => console.log(`Error loading template file:\n${files[0].name}`);

        const fr = new FileReader();
        fr.onerror = handleError;
        fr.onload = e => {
            try {
                const file = JSON.parse(e.target.result);
                this.loadFile(file);
            } catch (exception) {
                handleError();
            }
        };
        fr.readAsText(files.item(0));
    };

    showAddComponent = () =>
        this.setState({
            isComponentSelectOpen: true
        });

    hideAddComponent = () =>
        this.setState({
            isComponentSelectOpen: false
        });

    showEditComponent = componentEdit => {
        this.diagram.clearSelection();

        this.setState({
            isComponentEditOpen: true,
            componentEdit
        });
    };

    hideEditComponent = () =>
        this.setState({
            isComponentEditOpen: false,
            componentEdit: null
        });

    setTourRunning = isTourRunning => this.setState({ isTourRunning });

    showHelpTour = () => this.setTourRunning(true);

    showAddProperty = model => {
        this.setState({
            isComponentEditOpen: true,
            modelAdd: model
        });
    };

    handleUnloadTourTemplate = () => {
        if (!this.templateBeforeTour) {
            return;
        }

        this.loadFile(this.templateBeforeTour);
        this.templateBeforeTour = null;
    };

    handleCenterTourTemplateOffset = () => {
        this.diagram.getModel().setOffset((window.innerWidth - DIMENSIONS.width) / 2, (window.innerHeight - DIMENSIONS.height) / 2);
        this.diagram.realignGrid();
        this.diagram.repaint();
    };

    render() {
        const { isComponentSelectOpen, isComponentEditOpen, isTourRunning } = this.state;

        return (
            <>
                <Toolbar
                    isTourOpen={isTourRunning}
                    toggleTourOpen={() =>
                        this.setState(state => ({
                            isTourRunning: !state.isTourRunning
                        }))
                    }
                    handleClickSave={this.handleClickSave}
                    zoomToFitNodes={() => {
                        this.diagram.zoomToFitNodes(140);
                    }}
                    autoDistribute={() => {
                        this.diagram.autoDistribute();
                    }}
                />
                <AddTemplateButton isOpen={this.state.isComponentSelectOpen} handleClick={this.showAddComponent} />

                <AddNodeShape
                    isOpen={isComponentSelectOpen}
                    handleClose={this.hideAddComponent}
                    handleComponentDrop={this.diagram.handleComponentDrop}
                />

                <StyledWorkSpace id="templateWorkspace">
                    <Diagram engine={this.diagram} />
                </StyledWorkSpace>

                <ContextMenus
                    duplicateSelected={this.diagram.duplicateSelected}
                    cutSelected={this.diagram.cutSelected}
                    copySelected={this.diagram.copySelected}
                    pasteSelected={this.diagram.pasteSelected}
                    deleteSelected={this.diagram.deleteSelected}
                    undo={this.diagram.undo}
                    redo={this.diagram.redo}
                    zoomIn={this.diagram.zoomIn}
                    zoomOut={this.diagram.zoomOut}
                    configureComponent={this.showEditComponent}
                />

                <AddProperty
                    handleClick={() =>
                        this.setState(s => ({
                            isComponentEditOpen: !s.isComponentEditOpen
                        }))
                    }
                    isOpen={isComponentEditOpen}
                    modelAdd={this.state.modelAdd}
                />

                <div
                    style={{
                        display: isTourRunning ? 'block' : 'none',
                        position: 'absolute',
                        width: window.innerWidth * 0.7,
                        height: window.innerHeight * 0.5,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    id="templateWorkspaceArea"
                />
            </>
        );
    }
}
