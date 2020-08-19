import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

import { connect } from 'react-redux';
import uniqBy from 'lodash/uniqBy';
import { find } from 'lodash';
import { PREDICATES } from 'constants/graphSettings';
import { loadContributionData, loadResourceDataForContribution } from 'actions/statementBrowserStoreActions';

class GizMOGraph extends Component {
    constructor(props) {
        super(props);
        this.graphRoot = undefined;
        this.graphVis = props.graphVis;
        this.graphVis.getDataFromApi = this.getDataFromApi;

        // parent functions called by child
        this.updateDepthRange = props.updateDepthRange;
    }

    componentDidMount() {
        const graph = this.createGraphDataFromStatementStore();
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
                // this.graphVis.redrawGraphPreviousState({ graphBgColor: '#ecf0f1', graph: graph });
            }
        }
    }

    componentDidUpdate = prevProps => {
        if (this.props.layout !== prevProps.layout) {
            this.graphVis.updateLayout(this.props.layout);
        } else if (this.props.depth !== prevProps.depth) {
            // ignore the update event will take care
        } else if (!this.props.statementBrowserStore.blockUpdates) {
            const graph = this.createGraphDataFromStatementStore();
            if (this.graphVis.graphInitialized()) {
                this.graphVis.integrateNewData({ graphBgColor: '#ecf0f1', graph: graph });
                // this.graphVis.redrawGraphPreviousState({ graphBgColor: '#ecf0f1', graph: graph });
            }
        }

        if (this.props.layout !== prevProps.layout) {
            this.graphVis.updateLayout(this.props.layout);
        }
    };

    componentWillUnmount() {
        this.graphVis.stopBackgroundProcesses();
        if (this.graphVis.graphIsInitialized) {
            this.clearGraphData();
        }
    }

    getDataFromApi = (contributionOriginId, resourceId) => {
        console.log('reqeusting data', contributionOriginId, resourceId);

        if (contributionOriginId === undefined) {
            // requesting the contribution from the parent store;
            console.log('This should request the contribution as a resource id itself ');
            this.props.loadContributionData(resourceId);
        } else {
            console.log('>> this should load the contribution and call oit select resource value  ');
            this.props.loadResourceDataForContribution({ contributionOriginId, resourceId });
        }
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
        const contribStore = this.props.contributionStatementStore;
        console.log(contribStore);
        console.log('>>>>>>>>>>>>>>>>>>>>>>');
        const allContributionStatements = [];

        for (const name in contribStore) {
            const subjects = contribStore[name].resources;
            const predicates = contribStore[name].properties;
            const objects = contribStore[name].values;

            const currentContributionStatements = [];
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
                                currentContributionStatements.push({
                                    subject: resource,
                                    predicate: property,
                                    object: object,
                                    contributionOriginId: name
                                });
                            });
                        }
                    });
                }
            });
            allContributionStatements.push(currentContributionStatements);
        }
        // try to process the individual contribution arrays as graphs;

        allContributionStatements.forEach(subArray => {
            const validatedArrayOfStatements = this.validateSubGraphArray(subArray);
            const subGraph = this.processStatements(validatedArrayOfStatements, false);
            allNodes.push(...subGraph.nodes);
            allLinks.push(...subGraph.edges);
        });

        // remove duplicate nodes
        const graphNodes = uniqBy(allNodes, 'id');
        const graphLinks = uniqBy(allLinks, e => [e.from, e.to, e.label].join());

        // update node status for already exploread resources;
        const nodeMap = {};
        graphNodes.forEach(node => {
            nodeMap[node.id] = node;
        });

        for (const name in contribStore) {
            if (contribStore.hasOwnProperty(name)) {
                const resources = contribStore[name].resources;
                resources.allIds.forEach(item => {
                    if (resources.byId[item].isFechted && resources.byId[item].isFechted === true) {
                        if (nodeMap[resources.byId[item].existingResourceId]) {
                            nodeMap[resources.byId[item].existingResourceId].status = 'expanded';
                        }
                    }
                });
            }
        }

        return { nodes: graphNodes, edges: graphLinks };
    };

    validateSubGraphArray = statements => {
        // the statements have a contribution origin which serves as the root node;

        const validatedStatements = [];
        console.log('statements', statements);

        const contributionId = statements[0].contributionOriginId;
        const rootStatement = statements.filter(s => s.subject.id === contributionId);
        console.log('rootStatement', rootStatement);
        validatedStatements.push(...rootStatement);

        const queArray = [];
        queArray.push(...rootStatement);
        //
        let itteration = 0;
        while (queArray.length !== 0) {
            console.log('While Loop itteration', itteration++);

            const queItem = queArray[0];
            const objectId = queItem.object.id;
            console.log(queItem.object.label, 'object id', objectId);
            // find all possible nodes;
            const newStatements = statements.filter(statement => statement.subject.id === objectId);

            console.log(newStatements, typeof newStatements);
            queArray.push(...newStatements);
            validatedStatements.push(...newStatements);
            // deque;
            queArray.shift();
        }

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

    centerGraphEvent() {
        this.graphVis.zoomToExtent();
    }

    clearGraphData() {
        this.graphVis.svgRoot.remove();
    }

    /** Component Rendering Function **/
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
    metaInformationStore: PropTypes.object.isRequired,
    authorsOrcidStore: PropTypes.object.isRequired,
    contributionStatementStore: PropTypes.object.isRequired,
    statementBrowserStore: PropTypes.object.isRequired,

    // function
    loadContributionData: PropTypes.func.isRequired,
    loadResourceDataForContribution: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        statementBrowserStore: state.statementBrowserStore,
        statementBrowser: state.statementBrowser,
        contributionStatementStore: state.statementBrowserStore.contributionStatementStore,
        metaInformationStore: state.statementBrowserStore.metaInformationStore,
        authorsOrcidStore: state.statementBrowserStore.authorsOrcidStore
    };
};

// TODO : add graph interactions (connect to store actions)
const mapDispatchToProps = dispatch => ({
    loadContributionData: contributionID => dispatch(loadContributionData(contributionID)),
    loadResourceDataForContribution: data => dispatch(loadResourceDataForContribution(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GizMOGraph);
