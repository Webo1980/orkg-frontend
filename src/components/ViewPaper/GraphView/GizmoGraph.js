import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import uniqBy from 'lodash/uniqBy';
import { PREDICATES } from 'constants/graphSettings';
import { fetchStatementsForResource, graphLoadContributionResource, graphLoadResource, loadMultipleResource } from 'actions/statementBrowser';

class GizMOGraph extends Component {
    constructor(props) {
        super(props);
        this.graphRoot = undefined;
        this.graphVis = props.graphVis;
        this.graphVis.getDataFromApi = this.getDataFromApi;
        this.graphVis.fetchMultipleResourcesFromAPI = this.fetchMultipleResourcesFromAPI;

        // parent functions called by child
        this.prevGraph = {};
        this.updateDepthRange = props.updateDepthRange;
        this.state = { isLoading: false };
    }

    componentDidMount() {
        const graph = this.createGraphDataFromStatementStore();
        console.log(graph);
        this.prevGraph = graph;
        if (!this.graphVis.graphInitialized()) {
            this.graphVis.bindComponentValues({
                graph: graph,
                layout: this.props.layout,
                graphBgColor: '#ecf0f1',
                depth: this.props.depth
            });
        } else {
            if (this.graphVis.graphInitialized()) {
                this.graphVis.integrateNewData({ graphBgColor: '#ecf0f1', graph: graph });
            }
        }
    }

    componentDidUpdate = prevProps => {
        if (this.props.layout !== prevProps.layout) {
            console.log('GizMOGraph2 Updates -- LAYOUT');
            this.graphVis.updateLayout(this.props.layout);
        } else if (this.props.depth !== prevProps.depth) {
            console.log('GizMOGraph2 Updates -- DEPTH');
        } else {
            if (!this.state.isLoading) {
                console.log('THIS is a graph Update----');
                console.log('CHECK IF IT CHANGES EVERY TIME A NEW RESOURCE IS ADDED ');

                const graph = this.createGraphDataFromStatementStore();
                //
                console.log(this.prevGraph);
                console.log(graph);

                if (this.prevGraph === this.graph) {
                    console.log('BOTH GRAPHS ARE EQUAL ');
                } else {
                    console.log('BOTH GRAPHS ARE DIFFERENT');
                }
                //
                this.prevGraph = graph;

                if (this.graphVis.graphInitialized()) {
                    this.graphVis.integrateNewData({ graphBgColor: '#ecf0f1', graph: graph });
                }
            }
        }
    };

    componentWillUnmount() {
        this.graphVis.stopBackgroundProcesses();
        if (this.graphVis.graphIsInitialized) {
            this.clearGraphData();
        }
    }

    getDataFromApi = (contributionOriginId, resourceId, isContributionResource) => {
        console.log('TODO ');

        console.log('contributionOriginId', contributionOriginId);
        console.log('resourceId', resourceId);
        console.log('isContributionResource', isContributionResource);

        console.log('This should request the contribution as a resource id itself ');

        if (isContributionResource && resourceId) {
            // we know this expoloration is requesting the exploration of a node that is a contribution;
            // we also check if there is a resourceID ( just in case)
            console.log('>>>We should explore this contribution in the statementBrowser<<<');
            // calling the statementBrowser Action for that ;
            const isLoaded = false;
            this.setState({ isLoading: true });
            this.props.graphLoadContributionResource({ contributionId: resourceId, contributionIsLoaded: isLoaded }).then(() => {
                this.setState({ isLoading: false });
            });
        } else if (contributionOriginId && resourceId) {
            this.setState({ isLoading: true });
            this.props.graphLoadResource(resourceId).then(() => {
                this.setState({ isLoading: false });
            });
        } else {
            console.log('THIS IS NOT A CONTRIBUTION RESOURCE (COULD BE RESEARCHFIELD OR VENUE OR SO ... >>> TODO  ');
        }
    };

    fetchMultipleResourcesFromAPI = async arrayOfItems => {
        console.log('TODO ', arrayOfItems);
        console.log('>>> DONE FETCHING ONE LEVEL OF ITEMS >>>> ');
        this.setState({ isLoading: true });
        this.props.loadMultipleResource(arrayOfItems).then(() => {
            console.log('DONE FETCHING MULTIPLE ITEMS ');
            this.setState({ isLoading: false });
        });

        // } else {
        //     console.log('>> this should load the contribution and call oit select resource value  ');
        //     this.props.loadResourceDataForContribution({ contributionOriginId, resourceId });
        // }
    };

    createGraphDataFromStatementStore = () => {
        const allNodes = [];
        const allLinks = [];

        // first fetch metadata store;
        const mds = this.props.metaInformationStore ? this.props.metaInformationStore.statements : [];
        const metaInformationNodesAndLinks = this.processStatements(mds, true);
        allNodes.push(...metaInformationNodesAndLinks.nodes);
        allLinks.push(...metaInformationNodesAndLinks.edges);

        // then fetch orcid author ids;
        const authors_ods = this.props.authorsOrcidStore ? this.props.authorsOrcidStore.statements : [];
        const authrosOrcidStatements = this.processStatements(authors_ods, false);
        allNodes.push(...authrosOrcidStatements.nodes);
        allLinks.push(...authrosOrcidStatements.edges);

        // now extract the graph structure from the statement store;
        const statementBrowser = this.props.statementBrowser;
        const allContributionStatements = [];
        const subjects = statementBrowser.resources;
        const predicates = statementBrowser.properties;
        const objects = statementBrowser.values;

        // go through the subjects and build the statements
        subjects.allIds.forEach(id => {
            const resource = subjects.byId[id];
            resource.id = resource.existingResourceId;

            if (resource.propertyIds.length > 0) {
                // try to create a statement;
                resource.propertyIds.forEach(propId => {
                    const property = predicates.byId[propId];
                    property.id = property.existingPredicateId;

                    if (property.valueIds.length > 0) {
                        property.valueIds.forEach(valId => {
                            const object = objects.byId[valId];
                            object.id = object.resourceId;
                            if (object.type === 'object') {
                                object._class = 'resource';
                            }
                            allContributionStatements.push({
                                subject: resource,
                                predicate: property,
                                object: object
                            });
                        });
                    }
                });
            }
        });

        // good now we need to validate the created statements
        // This is required du to delete operations ( removing a resource has to remove its nested nodes and links from the graph)

        const validatedArrayOfStatements = this.validateGraphArray(allContributionStatements, this.props.statementBrowser.contributions);
        // the subGraph is the thing that starts at contribution level
        const subGraph = this.processStatements(validatedArrayOfStatements, false);
        allNodes.push(...subGraph.nodes);
        allLinks.push(...subGraph.edges);

        // // remove duplicate nodes
        const graphNodes = uniqBy(allNodes, 'id');
        const graphLinks = uniqBy(allLinks, e => [e.from, e.to, e.label].join());

        // create a node map
        const nodeMap = {};
        graphNodes.forEach(node => {
            nodeMap[node.id] = node;
        });

        // update node status for already explored resources;
        const resources = this.props.statementBrowser.resources;
        resources.allIds.forEach(item => {
            if (resources.byId[item].isFechted && resources.byId[item].isFechted === true) {
                if (nodeMap[resources.byId[item].existingResourceId]) {
                    nodeMap[resources.byId[item].existingResourceId].status = 'expanded';
                }
            }
        });
        console.log(graphNodes, graphLinks);
        return { nodes: graphNodes, edges: graphLinks };
    };

    validateGraphArray = (statements, contributions) => {
        // TODO : TESTING
        const validatedStatements = [];
        if (statements.length === 0) {
            // should not happen but just in case
            return validatedStatements;
        }

        // create a contributionsArray;
        const contribArray = [];
        Object.keys(contributions).forEach((key, index) => contribArray.push(key));

        contribArray.forEach(rootId => {
            const rootStatement = statements.filter(s => s.subject.id === rootId);
            validatedStatements.push(...rootStatement);

            const queArray = [];
            queArray.push(...rootStatement);

            // contributionRoot , is still required for hybrid views

            while (queArray.length !== 0) {
                const queItem = queArray[0];
                const objectId = queItem.object.id;
                // find all possible nodes;
                const newStatements = statements.filter(statement => statement.subject.id === objectId);
                newStatements.forEach(s => {
                    s.contributionOriginId = rootId;
                });
                queArray.push(...newStatements);
                validatedStatements.push(...newStatements);
                // deque;
                queArray.shift();
            }
        });
        console.log('>>>>', validatedStatements);
        return validatedStatements;
    };

    processSingleStatement = (nodes, edges, statement) => {
        const subjectLabel = statement.subject.label.substring(0, 20);
        const objectLabel = statement.object.label.substring(0, 20);
        const contributionOriginId = statement.contributionOriginId;
        nodes.push({
            id: statement.subject.id,
            label: subjectLabel,
            title: statement.subject.label,
            classificationArray: statement.subject.classes,
            contributionOriginId: contributionOriginId // can be undefined
        });

        // check if node type is resource or literal
        if (statement.object._class === 'resource') {
            nodes.push({
                id: statement.object.id,
                label: objectLabel,
                title: statement.object.label,
                classificationArray: statement.object.classes,
                contributionOriginId: contributionOriginId, // can be undefined
                isResearchFieldRelated:
                    statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD || statement.predicate.id === PREDICATES.HAS_SUB_RESEARCH_FIELD
            });
        } else {
            nodes.push({
                id: statement.object.id,
                label: objectLabel,
                title: statement.object.label,
                type: 'literal',
                status: 'leafNode'
            });
        }

        if (statement.predicate.id === PREDICATES.HAS_AUTHOR) {
            edges.push({
                from: statement.subject.id,
                to: statement.object.id,
                label: statement.predicate.label,
                isAuthorProp: true,
                predicateId: statement.predicate.id
            });
        } else if (statement.predicate.id === PREDICATES.HAS_DOI) {
            edges.push({
                from: statement.subject.id,
                to: statement.object.id,
                label: statement.predicate.label,
                isDOIProp: false,
                predicateId: statement.predicate.id
            }); // remove doi icon for now
        } else {
            // no Icon for the target node
            edges.push({
                from: statement.subject.id,
                to: statement.object.id,
                label: statement.predicate.label,
                predicateId: statement.predicate.id
            });
        }
    };

    processStatements = (statements, auxNode) => {
        let nodes = [];
        let edges = [];

        if (statements.length === 0) {
            return { nodes: nodes, edges: edges };
        }

        for (const statement of statements) {
            this.processSingleStatement(nodes, edges, statement);
        }
        // remove duplicate nodes
        nodes = uniqBy(nodes, 'id');
        edges = uniqBy(edges, e => [e.from, e.to, e.label].join());

        if (statements.length > 0 && auxNode) {
            // find node with paper resource ID;
            // heuristic its always node 0;
            // >> auxNode will only be set in the loadStatements function (only depth 0 statements)
            // which is only called on onOpened()

            const meta = {
                id: '__META_NODE__',
                label: 'Meta Information',
                title: 'Meta Information',
                classificationArray: []
            };
            const link = {
                from: nodes[0].id,
                to: meta.id,
                label: 'has meta information'
            };

            nodes.push(meta);
            edges.push(link);

            edges.forEach(edge => {
                if (edge.predicateId) {
                    if (
                        edge.predicateId === PREDICATES.HAS_DOI ||
                        edge.predicateId === PREDICATES.HAS_VENUE ||
                        edge.predicateId === PREDICATES.HAS_AUTHOR ||
                        edge.predicateId === PREDICATES.HAS_PUBLICATION_MONTH ||
                        edge.predicateId === PREDICATES.HAS_PUBLICATION_YEAR ||
                        edge.predicateId === PREDICATES.HAS_RESEARCH_FIELD ||
                        edge.predicateId === PREDICATES.HAS_SUB_RESEARCH_FIELD ||
                        edge.predicateId === PREDICATES.URL
                    ) {
                        edge.from = meta.id;
                    }
                }
            });
        }

        return { nodes: nodes, edges: edges };
    };

    clearGraphData() {
        this.graphVis.svgRoot.remove();
    }

    /** Component Rendering   Function **/
    render() {
        return <div id="graphRendering" style={{ width: '100%', height: '100%', backgroundColor: 'gray' }} />;
    }
}

/** Property Type Validation **/
GizMOGraph.propTypes = {
    // any
    updateDepthRange: PropTypes.func.isRequired,
    graphVis: PropTypes.any.isRequired,
    depth: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired,

    // object
    statementBrowser: PropTypes.object.isRequired,
    metaInformationStore: PropTypes.object.isRequired,
    authorsOrcidStore: PropTypes.object.isRequired,

    // function
    // loadContributionData: PropTypes.func.isRequired,
    // loadMultipleResource: PropTypes.func.isRequired,
    fetchStatementsForResource: PropTypes.func.isRequired,
    graphLoadResource: PropTypes.func.isRequired,
    loadMultipleResource: PropTypes.func.isRequired,
    graphLoadContributionResource: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        statementBrowser: state.statementBrowser,
        metaInformationStore: state.metaInformationStore.metaInformationStore,
        authorsOrcidStore: state.metaInformationStore.authorsOrcidStore
    };
};

const mapDispatchToProps = dispatch => ({
    fetchStatementsForResource: data => dispatch(fetchStatementsForResource(data)),
    graphLoadResource: data => dispatch(graphLoadResource(data)),
    loadMultipleResource: data => dispatch(loadMultipleResource(data)),
    graphLoadContributionResource: data => dispatch(graphLoadContributionResource(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GizMOGraph);
