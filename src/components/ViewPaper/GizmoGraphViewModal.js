import React, {Component} from 'react';
import {getStatementsBySubject} from '../../network';
import {connect} from 'react-redux';
import * as PropTypes from 'prop-types';
// import Graph from 'react-graph-vis';
import GizmoGraph from './GizmoGraph';
import {Modal, ModalHeader, ModalBody, Input, Form, FormGroup, Label, Button} from 'reactstrap';
import uniqBy from 'lodash/uniqBy';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {faSpinner, faProjectDiagram, faAngleDoubleLeft, faAngleDoubleUp} from '@fortawesome/free-solid-svg-icons';
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';

class GraphView extends Component {
    constructor(props) {
        super(props);

        this.child = React.createRef();
        this.updateDepthRange = this.updateDepthRange.bind(this);
        this.seenDepth = -1
    };

    state = {
        nodes: [],
        edges: [],
        statements: [],
        depth: 5,

        isLoadingStatements: false,
        maxDepth: 25,
        seenFullGraph: false,
        layoutSelectionOpen: false,
        layout: 'force',
        windowHeight: 0 // want this for auto aligning the size of the modal window
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
        this.seenDepth = this.state.depth;
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.showDialog === false) {
            // reset some variables so data reloading is enabled;
            this.surpressComponentUpdate = false;
            this.seenDepth = -1
        }

        // load statements again if depth is changed
        if (prevState.depth !== this.state.depth) {
            if (this.surpressComponentUpdate === true) {
                // console.log('Blocking reloading the data stuff ');
                this.child.current.filterGraphByDepth(this.state.depth);
            } else {
                if (this.seenDepth < this.state.depth) {
                    this.loadStatements().then(() => {
                        this.seenDepth = this.state.depth;
                    });
                } else {
                    // console.log('Already seen that depth, let the vis module take care of that');
                    this.child.current.filterGraphByDepth(this.state.depth);
                }
            }
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    };

    updateDepthRange(value, fullGraph) {
        // called from the child to ensure that the depth has correct range
        if (fullGraph) {
            this.surpressComponentUpdate = true;
            this.setState({maxDepth: value, depth: value, seenFullGraph: true});
            return;
        }
        if (value < this.state.depth || this.state.seenFullGraph === true) {
            // console.log('We have seen the full Graph so we just update the graph view;');
            this.surpressComponentUpdate = true;
            this.setState({depth: value});
        } else {
            if (!fullGraph && this.state.seenFullGraph === false) {
                // console.log('Case we want to load more data');
                this.surpressComponentUpdate = false;
                this.setState({depth: value, seenFullGraph: false});
            } else {
                // console.log('Case we have seen the full Graph');
                this.surpressComponentUpdate = true;
                this.setState({maxDepth: value, seenFullGraph: true});
            }
        }
    }

    loadStatements = async () => {
        this.setState({isLoadingStatements: true});
        if (this.props.paperId) {
            let statements = await this.getResourceAndStatements(this.props.paperId, 0, []);
            let nodes = [];
            let edges = [];

            for (let statement of statements) {
                // limit the label length to 20 chars
                const subjectLabel = statement.subject.label.substring(0, 20);
                const objectLabel = statement.object.label.substring(0, 20);

                nodes.push({id: statement.subject.id, label: subjectLabel, title: statement.subject.label});
                // check if node type is resource or literal
                if (statement.object._class === 'resource') {
                    nodes.push({id: statement.object.id, label: objectLabel, title: statement.object.label});
                } else {
                    nodes.push({
                        id: statement.object.id,
                        label: objectLabel,
                        title: statement.object.label,
                        type: 'literal'
                    });
                }
                edges.push({from: statement.subject.id, to: statement.object.id, label: statement.predicate.label});
            }
            // remove duplicate nodes
            nodes = uniqBy(nodes, 'id');

            this.setState({
                nodes,
                edges,
            });
        } else {
            this.visualizeAddPaper();
        }
        this.setState({isLoadingStatements: false});
    };

    // Code is not very organized, structure can be improved
    visualizeAddPaper = () => {
        let nodes = [];
        let edges = [];
        const {title, authors, doi, publicationMonth, publicationYear, selectedResearchField, contributions} = this.props.addPaper;

        // title
        nodes.push({id: 'title', label: title.substring(0, 20), title: title});

        // authors
        if (authors.length > 0) {
            for (let author of authors) {
                nodes.push({id: author.label, label: author.label.substring(0, 20), title: author.label});
                edges.push({from: 'title', to: author.label, label: 'has author'});
            }
        }

        //doi
        nodes.push({id: 'doi', label: doi.substring(0, 20), title: doi, type: 'literal'});
        edges.push({from: 'title', to: 'doi', label: 'has doi'});

        //publicationMonth
        nodes.push({id: 'publicationMonth', label: publicationMonth, title: publicationMonth});
        edges.push({from: 'title', to: 'publicationMonth', label: 'has publication month'});

        //publicationYear
        nodes.push({id: 'publicationYear', label: publicationYear, title: publicationYear, type: 'literal'});
        edges.push({from: 'title', to: 'publicationYear', label: 'has publication year'});

        //research field TODO: convert to readable label
        nodes.push({id: 'researchField', label: selectedResearchField, title: selectedResearchField});
        edges.push({from: 'title', to: 'researchField', label: 'has research field'});

        //contributions
        if (Object.keys(contributions['byId']).length) {
            for (let contributionId in contributions['byId']) {
                if (contributions['byId'].hasOwnProperty(contributionId)) {
                    let contribution = contributions['byId'][contributionId];

                    nodes.push({id: contribution.resourceId, label: contribution.label, title: contribution.label});
                    edges.push({from: 'title', to: contribution.resourceId, label: 'has contribution'});

                    //research problems
                    for (let problem of contribution.researchProblems) {
                        nodes.push({
                            id: contribution.resourceId + problem.label,
                            label: problem.label,
                            title: problem.label
                        });
                        edges.push({
                            from: contribution.resourceId,
                            to: contribution.resourceId + problem.label,
                            label: 'has research problem'
                        });
                    }

                    //contribution statements
                    let statements = this.addPaperStatementsToGraph(contribution.resourceId, [], []);
                    nodes.push(...statements.nodes);
                    edges.push(...statements.edges);
                }
            }
        }

        //  ensure no nodes with duplicate IDs exist
        nodes = uniqBy(nodes, 'id');

        this.setState({
            nodes,
            edges,
        });
    };

    addPaperStatementsToGraph = (resourceId, nodes, edges) => {
        let statementBrowser = this.props.statementBrowser;
        let resource = statementBrowser.resources.byId[resourceId];

        if (resource.propertyIds.length > 0) {
            for (let propertyId of resource.propertyIds) {
                let property = statementBrowser.properties.byId[propertyId];

                if (property.valueIds.length > 0) {
                    for (let valueId of property.valueIds) {
                        let value = statementBrowser.values.byId[valueId];
                        let id = value.resourceId ? value.resourceId : valueId;

                        //add the node and relation
                        nodes.push({id: id, label: value.label, title: value.label});
                        edges.push({from: resourceId, to: id, label: property.label});
                        console.log(value);
                        if (value.type === 'object') {
                            this.addPaperStatementsToGraph(id, nodes, edges);
                        }
                    }
                }
            }
        }

        return {
            nodes,
            edges,
        };
    };


    centerGraph = () => {
        this.child.current.centerGraphEvent();
    };

    clearGraphData = () => {
        this.child.current.clearGraphData();
    };

    getLayoutIcon() {
        if (this.state.layout === 'force') {
            return faProjectDiagram;
        }
        if (this.state.layout === 'treeH') {
            return faAngleDoubleLeft;
        }
        if (this.state.layout === 'treeV') {
            return faAngleDoubleUp;
        }
    }

    updateDimensions = () => {
        // test
        const offset = 28 * 2 + 65;
        this.setState({windowHeight: window.innerHeight - offset});
    };


    handleDepthChange = (event) => {
        this.setState({depth: event.target.value});
    };

    getResourceAndStatements = async (resourceId, depth, list) => {
        if (depth > this.state.depth - 1) {
            return list;
        }

        let statements = await getStatementsBySubject({id: resourceId});

        if (statements.length > 0) {
            list.push(...statements);
            for (let statement of statements) {
                if (statement.object._class === 'resource') {
                    await this.getResourceAndStatements(statement.object.id, depth + 1, list);
                }
            }

            return list;
        } else {
            return list;
        }
    };

    render() {
        const graph = {
            nodes: this.state.nodes,
            edges: this.state.edges,
        };


        /*const events = {
            select: function (event) {
                var { nodes, edges } = event;
            }
        };*/
        // this.child=React.createRef();
        // console.log('++++++++++++++++++++++++++++++++++++');
        // console.log(this.child);
        return (
            <Modal isOpen={this.props.showDialog}
                   toggle={this.props.toggle}
                   size="lg"
                   onOpened={this.loadStatements}
                   style={{maxWidth: '90%'}}
            >
                <ModalHeader toggle={this.props.toggle}>Paper graph visualization
                    {this.props.paperId && (
                        <>
                            <Form style={{display: 'inline-flex'}}>
                                <FormGroup className="d-flex" style={{
                                    marginBottom: -40,
                                    position: 'absolute',
                                    zIndex: '999',
                                    marginLeft: '50px',
                                    marginTop: '-28px'
                                }}
                                >
                                    <Label for="depth" className="align-self-center mb-0 mr-2">
                                        Depth
                                    </Label>
                                    <Input type="number" name="select" id="depth" onChange={this.handleDepthChange}
                                           value={this.state.depth} style={{width: 60}} min="1"
                                           max={this.state.maxDepth}
                                    />
                                </FormGroup>
                            </Form>
                            <div style={{display: 'inline-flex', position: 'absolute', left: '450px'}}>
                                <Button
                                    color="darkblue"
                                    size="sm"
                                    //    className='mb-4 mt-4'
                                    style={{margin: '0 10px'}}
                                    onClick={this.centerGraph}
                                >
                                    <Icon icon={faProjectDiagram} className="mr-1" /> Center Graph
                                </Button>

                                {/*/!*<Button*!/*/}
                                {/*/!*  color='darkblue'*!/*/}
                                {/*/!*  size='sm'*!/*/}
                                {/*/!*  //    className='mb-4 mt-4'*!/*/}
                                {/*/!*  // style={{position:'absolute', left: '450px', marginLeft: '10px'}}*!/*/}
                                {/*/!*  style={{margin: '0 10px'}}*!/*/}
                                {/*/!*  onClick={this.clearGraphData}*!/*/}
                                {/*/!*>*!/*/}
                                {/*  <Icon icon={faProjectDiagram} className='mr-1'/> Clear Data*/}
                                {/*</Button>*/}
                                <Dropdown color="darkblue"
                                          size="'sm"
                                    //    className='mb-4 mt-4'
                                          style={{margin: '0 10px'}}
                                          isOpen={this.state.layoutSelectionOpen} toggle={() => {
                                    this.setState({layoutSelectionOpen: !this.state.layoutSelectionOpen})
                                }}
                                >
                                    <DropdownToggle caret color="darkblue">
                                        Layout:
                                        <Icon icon={this.getLayoutIcon()} className="mr-1"
                                              style={{width: '40px'}}
                                        />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={
                                            () => {
                                                this.setState({layout: 'force'});
                                            }}
                                        >
                                            <Icon icon={faProjectDiagram} className="mr-1" style={{width: '40px'}} />
                                            Force Directed
                                        </DropdownItem>
                                        <DropdownItem onClick={() => {
                                            this.setState({layout: 'treeH'});
                                        }}
                                        >
                                            <Icon icon={faAngleDoubleLeft} className="mr-1" style={{width: '40px'}} />
                                            Horizontal Tree
                                        </DropdownItem>
                                        <DropdownItem onClick={() => {
                                            this.setState({layout: 'treeV'});
                                        }}
                                        >
                                            <Icon icon={faAngleDoubleUp} className="mr-1" style={{width: '40px'}} />
                                            Vertical Tree
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </>
                    )}
                </ModalHeader>
                <ModalBody style={{padding: '0', minHeight: '100px', height: this.state.windowHeight}}>
                    {!this.state.isLoadingStatements && (
                        <GizmoGraph
                            ref={this.child} isLoadingStatements={this.state.isLoadingStatements}
                            depth={this.state.depth} updateDepthRange={this.updateDepthRange}
                            maxDepth={this.state.maxDepth} layout={this.state.layout}
                            graph={graph}
                        />
                    )}
                    {this.state.isLoadingStatements && (
                        <div className="text-center text-primary mt-4 mb-4">
                            {/*using a manual fixed scale value for the sinner scale! */}
                            <span style={{fontSize: this.state.windowHeight / 5}}>
                                <Icon icon={faSpinner} spin />
                            </span>
                            <br />
                            <h2 className="h5">Loading graph...</h2>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

GraphView.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addPaper: PropTypes.object.isRequired,
    statementBrowser: PropTypes.object.isRequired,
    paperId: PropTypes.string,
};

const mapStateToProps = (state) => ({
    addPaper: state.addPaper,
    statementBrowser: state.statementBrowser,
});

export default connect(mapStateToProps)(GraphView);
