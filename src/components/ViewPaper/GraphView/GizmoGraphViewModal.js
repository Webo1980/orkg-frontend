import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, Input, Form, FormGroup, Label, Button } from 'reactstrap';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faProjectDiagram, faHome, faSitemap, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// moving GraphVis here in order to maintain the layouts and status related stuff;
import GizmoGraph from './GizmoGraph';
import GraphVis from '../../../libs/gizmo/GraphVis';
import SearchAutoComplete from './SearchAutoComplete';

class GraphView extends Component {
    constructor(props) {
        super(props);
        this.searchComponent = React.createRef();
        this.seenDepth = -1;
        this.graphVis = new GraphVis();
        this.graphVis.propagateMaxDepthValue = this.updateDepthRange;
        this.graphVis.propagateDictionary = this.propagateDictionary;
    }

    state = {
        initializeGraph: false,
        seenDepth: -1,
        depth: 1,
        maxDepth: 25,
        seenFullGraph: false,
        layoutSelectionOpen: false,
        exploringFullGraph: false,
        halfView: false, //debutTest;
        layout: 'force',
        windowHeight: 0 // want this for auto aligning the size of the modal window
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    propagateDictionary = () => {
        if (this.searchComponent.current) {
            this.searchComponent.current.updateDictionary();
        }
    };

    centerGraph = () => {
        this.graphVis.zoomToExtent();
    };

    // not used anymore, stays for mem leak analysis (todo)
    clearGraphData = () => {
        this.child.current.clearGraphData();
    };

    updateDimensions = () => {
        // test
        const offset = 28 * 2 + 65;
        this.setState({ windowHeight: window.innerHeight - offset });
    };

    handleDepthChange = event => {
        if (event.target.value) {
            this.setState({ depth: parseInt(event.target.value) });
            this.graphVis.depthUpdateEvent(parseInt(event.target.value)).then();
        }
    };

    exploreTheFullGraph = async () => {
        this.setState({ exploringFullGraph: true });
        await this.graphVis.fullExplore();
        this.setState({ exploringFullGraph: false });
    };

    updateDepthRange = (value, fullGraph) => {
        // called from the child to ensure that the depth has correct range
        if (fullGraph) {
            this.setState({ maxDepth: value, depth: value, seenFullGraph: true });
            return;
        }
        if (value < this.state.depth || this.state.seenFullGraph === true) {
            // Case we have seen the full Graph so we just update the graph view
            this.setState({ depth: value });
        } else {
            if (!fullGraph && this.state.seenFullGraph === false) {
                //Case we want to load more data
                this.setState({ depth: value, seenFullGraph: false });
            } else {
                //Case we have seen the full Graph on going deeper
                this.setState({ maxDepth: value, seenFullGraph: true });
            }
        }
    };

    renderHeader = () => {
        return (
            <div className="d-flex" style={{ height: '40px' }}>
                <div style={{ width: '300px', height: '40px', paddingTop: '5px' }}>Paper graph visualization</div>
                <div style={{ width: '100%', display: 'flex' }}>
                    <Form inline className="ml-4">
                        <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                            <Label for="depth" className="mb-0 mr-2">
                                Depth
                            </Label>
                            <Input
                                type="number"
                                name="select"
                                id="depth"
                                bsSize="sm"
                                onChange={this.handleDepthChange}
                                onKeyDown={event => {
                                    // prevent the reload when enter is pressed
                                    if (event.keyCode === 13) {
                                        event.preventDefault();
                                        this.graphVis.depthUpdateEvent(this.state.depth).then();
                                    }
                                }}
                                value={this.state.depth}
                                style={{ width: '60px' }}
                                min="1"
                                max={this.state.maxDepth}
                            />
                        </FormGroup>
                    </Form>
                    <div style={{ flexDirection: 'row', display: 'flex', flexGrow: '1' }}>
                        <Button
                            color="darkblue"
                            size="sm"
                            style={{ margin: '0 10px', flexGrow: '1', display: 'flex', alignSelf: 'center', width: '155px' }}
                            onClick={this.exploreTheFullGraph}
                            disabled={this.state.exploringFullGraph}
                        >
                            {!this.state.exploringFullGraph ? (
                                <>
                                    <Icon icon={faExpandArrowsAlt} className="mr-1 align-self-center" />
                                    Expand all nodes{' '}
                                </>
                            ) : (
                                <>
                                    <Icon icon={faSpinner} spin className="mr-1 align-self-center" /> Expanding graph
                                </>
                            )}
                        </Button>
                        <Button
                            color="darkblue"
                            size="sm"
                            style={{ margin: '0 10px', flexGrow: '1', display: 'flex', alignSelf: 'center', width: '130px' }}
                            onClick={this.centerGraph}
                        >
                            <Icon icon={faHome} className="mr-1 align-self-center" /> Center graph
                        </Button>
                        <Dropdown
                            color="darkblue"
                            size="sm"
                            style={{ marginLeft: '10px', flexGrow: '1', display: 'flex', height: 'min-content', paddingTop: '5px' }}
                            isOpen={this.state.layoutSelectionOpen}
                            toggle={() => {
                                this.setState({ layoutSelectionOpen: !this.state.layoutSelectionOpen });
                            }}
                        >
                            <DropdownToggle caret color="darkblue">
                                Layout:
                                <Icon
                                    icon={this.state.layout === 'force' ? faProjectDiagram : faSitemap}
                                    rotation={this.state.layout === 'treeH' ? 270 : undefined}
                                    className="mr-1"
                                    style={{ width: '40px' }}
                                />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem
                                    onClick={() => {
                                        if (this.state.layout === 'force') {
                                            return;
                                        }
                                        this.setState({ layout: 'force' });
                                    }}
                                >
                                    <Icon icon={faProjectDiagram} className="mr-1" style={{ width: '40px' }} />
                                    Force directed
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => {
                                        if (this.state.layout === 'treeH') {
                                            // forcing reset of the layout
                                            this.graphVis.updateLayout('treeH');
                                            return;
                                        }
                                        this.setState({ layout: 'treeH' });
                                    }}
                                >
                                    <Icon icon={faSitemap} rotation={270} className="mr-1" style={{ width: '40px' }} />
                                    Horizontal tree
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => {
                                        if (this.state.layout === 'treeV') {
                                            // forcing reset of the layout
                                            this.graphVis.updateLayout('treeV');
                                            return;
                                        }
                                        this.setState({ layout: 'treeV' });
                                    }}
                                >
                                    <Icon icon={faSitemap} className="mr-1" style={{ width: '40px' }} />
                                    Vertical tree
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <SearchAutoComplete ref={this.searchComponent} placeHolder="Search" graphVis={this.graphVis} />
                    </div>
                    <Button
                        onClick={() => {
                            this.setState({ halfView: !this.state.halfView });
                        }}
                    >
                        Debug
                    </Button>
                </div>
            </div>
        );
    };

    render() {
        const styledObject = { maxWidth: '90%', marginBottom: 0 };
        if (this.state.halfView === true) {
            styledObject.width = '50%';
            styledObject.float = 'right';
        }

        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle} size="lg" onOpened={() => {}} style={styledObject}>
                <ModalHeader toggle={this.props.toggle}>{this.renderHeader()}</ModalHeader>
                <ModalBody style={{ padding: '0', minHeight: '100px', height: this.state.windowHeight }}>
                    <GizmoGraph
                        depth={this.state.depth}
                        updateDepthRange={this.updateDepthRange}
                        initializeGraph={this.state.initializeGraph}
                        maxDepth={this.state.maxDepth}
                        layout={this.state.layout}
                        graphVis={this.graphVis}
                        graphBgColor="#ecf0f1"
                    />
                </ModalBody>
            </Modal>
        );
    }
}

GraphView.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default GraphView;
