import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { getReseachProblemsOfContribution, loadCachedVersion } from 'actions/statementBrowser';
import { selectContribution, updateResearchProblems } from 'actions/viewPaper';
import { updateStatementStore } from 'actions/statementBrowserStoreActions';
import { connect } from 'react-redux';
import uniqBy from 'lodash/uniqBy';
import { PREDICATES } from 'constants/graphSettings';

class GizMOGraph extends Component {
    constructor(props) {
        super(props);
        this.graphRoot = undefined;
        this.graphVis = props.graphVis;

        // parent functions called by child
        this.updateDepthRange = props.updateDepthRange;
    }

    componentDidMount() {
        console.log('The graph visualization is mounted!!! ');
        const graph = this.createGraphDataFromStatementStore();
        if (!this.graphVis.graphInitialized()) {
            this.graphVis.bindComponentValues({
                graph: graph,
                layout: this.props.layout,
                graphBgColor: '#ecf0f1',
                depth: this.props.depth
            });
        } else {
            console.log('Should redraw the graph');
            this.graphVis.redrawGraphPreviousState('#ecf0f1');
        }
    }

    componentDidUpdate = prevProps => {
        console.log('GizMOGraph Container Updates');
        console.log(this.props);
        this.createGraphDataFromStatementStore();

        if (this.props.layout !== prevProps.layout) {
            this.graphVis.updateLayout(this.props.layout);
        }
    };

    componentWillUnmount() {
        this.graphVis.stopBackgroundProcesses();
        if (this.graphVis.graphIsInitialized) {
            // todo : make sure memory is cleared!
            this.clearGraphData();
        }
    }

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
                                currentContributionStatements.push({ subject: resource, predicate: property, object: object });
                            });
                        }
                    });
                }
            });
            allContributionStatements.push(currentContributionStatements);
        }
        // try to process the individual contribution arrays as graphs;
        allContributionStatements.forEach(subArray => {
            const subGraph = this.processStatements(subArray, false);
            allNodes.push(...subGraph.nodes);
            allLinks.push(...subGraph.edges);
        });

        // remove duplicate nodes
        const graphNodes = uniqBy(allNodes, 'id');
        const graphLinks = uniqBy(allLinks, e => [e.from, e.to, e.label].join());

        return { nodes: graphNodes, edges: graphLinks };
    };

    processSingleStatement = (nodes, edges, statement) => {
        const subjectLabel = statement.subject.label.substring(0, 20);
        const objectLabel = statement.object.label.substring(0, 20);

        nodes.push({
            id: statement.subject.id,
            label: subjectLabel,
            title: statement.subject.label,
            classificationArray: statement.subject.classes
        });

        // check if node type is resource or literal
        if (statement.object._class === 'resource') {
            nodes.push({
                id: statement.object.id,
                label: objectLabel,
                title: statement.object.label,
                classificationArray: statement.object.classes,
                isResearchFieldRelated:
                    statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD || statement.predicate.id === PREDICATES.HAS_SUB_RESEARCH_FIELD
            });
        } else {
            nodes.push({
                id: statement.object.id,
                label: objectLabel,
                title: statement.object.label,
                type: 'literal'
            });
        }

        if (statement.predicate.id === PREDICATES.HAS_AUTHOR) {
            // add user Icon to target node if we have 'has author' property === P27
            edges.push({
                from: statement.subject.id,
                to: statement.object.id,
                label: statement.predicate.label,
                isAuthorProp: true,
                predicateId: statement.predicate.id
            });
        } else if (statement.predicate.id === PREDICATES.HAS_DOI) {
            // add DOI Icon to target node
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
    updateDepthRange: PropTypes.func.isRequired,
    graphVis: PropTypes.any.isRequired,
    depth: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired,

    metaInformationStore: PropTypes.object.isRequired,
    authorsOrcidStore: PropTypes.object.isRequired,
    contributionStatementStore: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        statementBrowserStore: state.statementBrowserStore,
        contributionStatementStore: state.statementBrowserStore.contributionStatementStore,
        metaInformationStore: state.statementBrowserStore.metaInformationStore,
        authorsOrcidStore: state.statementBrowserStore.authorsOrcidStore
    };
};

// TODO : add graph interactions (connect to store actions)
const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GizMOGraph);
