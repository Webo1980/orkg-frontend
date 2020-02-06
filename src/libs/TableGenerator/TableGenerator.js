import React, { Component } from 'react';
import TableView from './TableView';
import { guid } from 'utils';
import { connect } from 'react-redux';
import {
    predicatesUrl,
    createPredicate,
    resourcesUrl,
    createResourceStatement,
    createResource,
    createLiteral,
    createLiteralStatement
} from '../../network';
import { createValue, createProperty } from '../../actions/statementBrowser';
import PropTypes from 'prop-types';
class TableGenerator extends Component {
    constructor(props) {
        super(props);

        this.updateTableSize = this.updateTableSize.bind(this);
        this.killTheTable = this.props.killTheTable;
        this.insertTableIntoGraph = this.insertTableIntoGraph.bind(this);
    }

    state = {
        width: 200,
        height: 200,
        backgroundColor: '#959e9c'
    };

    componentDidMount() {}

    componentDidUpdate = prevProps => {};

    componentWillUnmount() {}

    updateTableSize(size) {
        console.log('This is now the right place to update the size');
        console.log(size);
        this.setState({ width: size.width, height: size.height });
        console.log('New State of the rendering div is ');
        console.log(this.state);
        // console.log(this.state.width+ ' '+ this.state.width);
    }

    async insertTableIntoGraph(rootNode) {
        console.log('I have a root node');
        console.log(rootNode);
        console.log(this.props.parentResource);

        // create execution plan
        const executionPlan = {};
        executionPlan.rootResource = { resourceId: this.props.parentResource, hasTabularData: rootNode };
        let resource = this.props.resources.byId[this.props.parentResource.resourceId];

        console.log('Create the property in the statement Browser');
        const pID = guid();

        this.props.createProperty({
            propertyId: pID,
            existingPredicateId: 'HAS_RESULTS',
            resourceId: this.props.parentResource.resourceId,
            label: 'Has results'
        });

        console.log('Create the resource ID');
        if (!resource.existingResourceId) {
            resource = await createResource('Result');
            resource = resource.id;
        } else {
            resource = resource.existingResourceId;
        }
        console.log(resource);
        console.log('p1=createNewProperty(hasTabularData)');
        const pHasTabularData = await createPredicate('hasTabularData'); // fixed ID
        console.log('r1=createResourceObject(TabularData)');
        const r1 = await createResource('TabularData');
        console.log('Link It >> ' + this.props.parentResource.resourceId + '-> p1-> r1');
        const statement = await createResourceStatement(resource, pHasTabularData.id, r1.id);

        // r1 plan ;
        console.log('\tr1 Plan (for number of row nodes)');

        const pHasRowData = await createPredicate('hasRowData'); // fixed ID

        let it = 2;
        let numRows = 0;
        const rowResources = [];
        for (const name in rootNode) {
            console.log('\tp' + it + '= createNewProperty(hasRowData)');
            console.log('\tr' + it + '= createResourceObject(' + name + ')');
            const rowResource = await createResource(name);
            const rowStatement = await createResourceStatement(r1.id, pHasRowData.id, rowResource.id);
            rowResources.push(rowResource.id);
            it++;
            numRows++;
        }
        /*
        it = 2;
        for (const name in rootNode) {
            console.log('\tLink It >> r1 -> p' + it + ' -> r' + it);
            it++;
        }
        */

        const pMethod = await createPredicate('Method'); // fixed ID

        const pHasCellNode = await createPredicate('hasCellNode'); // fixed ID

        // plannig for the rowNodes;
        let currentResourceCounter = numRows + 2;
        for (let rI = 0; rI < numRows; rI++) {
            console.log('\t\tPlan rowNode' + rI + ' (r' + (rI + 2) + ')');
            const selector = 'rowNode' + rI;
            const nodeItem = rootNode[selector];
            console.log('\t\tpX = createNewProperty(method)');
            console.log('\t\tr' + currentResourceCounter++ + ' = createLiteralObject(' + nodeItem.method + ')');
            const nodeMethodLiteral = await createLiteral(nodeItem.method);
            console.log('\t\tLink It >> r' + (rI + 2) + ' -> pY -> r' + (currentResourceCounter - 1));
            await createLiteralStatement(rowResources[rI], pMethod.id, nodeMethodLiteral.id);

            for (let cI = 0; cI < nodeItem.cellNodes.length; cI++) {
                console.log('\t\tpY = createNewProperty(hasCellNode)');
                console.log('\t\tr' + currentResourceCounter++ + ' = createResourceObject(CellNode_' + cI + ')');
                const cellNodeResource = await createResource(`CellNode${cI}`);

                console.log('\t\tLink It >> r' + (rI + 2) + ' -> pY -> r' + (currentResourceCounter - 1));
                await createResourceStatement(rowResources[rI], pHasCellNode.id, cellNodeResource.id);

                console.log('\t\t\tPlan cellNode' + cI + ' (r' + (currentResourceCounter - 1) + ')');
                let propCounter = 0;
                const propIDS = [];
                let valueCounter = 0;
                const valueIDS = [];
                for (const name in nodeItem.cellNodes[cI]) {
                    console.log('\t\t\tpC' + propCounter + ' = createNewProperty(' + name + ')');
                    const predicate = await createPredicate(name); // fixed ID
                    propIDS.push(predicate.id);
                    console.log('\t\t\trV' + valueCounter + ' = createLiteralObject(' + nodeItem.cellNodes[cI][name] + ')');
                    const value = await createLiteral(nodeItem.cellNodes[cI][name]);
                    valueIDS.push(value.id);
                    propCounter++;
                    valueCounter++;
                    await createLiteralStatement(cellNodeResource.id, predicate.id, value.id);
                }
                for (let q = 0; q < propCounter; q++) {
                    console.log('\t\t\tLink It >> r' + (currentResourceCounter - 1) + ' -> pC' + q + ' -> rV' + q);
                }
            }
        }

        this.props.createValue({
            label: 'Result',
            type: 'object',
            propertyId: pID,
            existingResourceId: resource,
            isExistingValue: true,
            statementId: statement.id,
            shared: 0
        });
        this.killTheTable();
    }

    /** Component Rendering Function **/
    render() {
        return (
            <div
                id="graphRendering"
                style={{
                    maxWidth: '650px',
                    overflowX: 'scroll',
                    overflowY: 'hidden',
                    width: this.state.width < 500 ? 500 : this.state.width,
                    height: this.state.height,
                    backgroundColor: this.state.backgroundColor
                }}
            >
                {' '}
                <TableView
                    viewportUpdate={this.updateTableSize}
                    size={{ width: this.state.width < 500 ? 500 : this.state.width, height: this.state.height }}
                    killTheTable={this.killTheTable}
                    insertTableIntoGraph={this.insertTableIntoGraph}
                />
            </div>
        );
    }
}

TableGenerator.propTypes = {
    killTheTable: PropTypes.func.isRequired,
    parentResource: PropTypes.any.isRequired,
    resources: PropTypes.object.isRequired,
    createValue: PropTypes.func.isRequired,
    createProperty: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        resources: state.statementBrowser.resources
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createProperty: data => dispatch(createProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TableGenerator);
