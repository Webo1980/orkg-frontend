import React, { Component } from 'react';
import TableView from './TableView';
import { predicatesUrl, createPredicate } from '../../network';
import { createProperty } from '../../actions/statementBrowser';
import { resourcesUrl, createResourceStatement, createResource, createLiteral, createLiteralStatement } from '../../network';
import { createValue } from '../../actions/statementBrowser';
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

    insertTableIntoGraph(rootNode) {
        console.log('I have a root node');
        console.log(rootNode);
        console.log(this.props.parentResource);

        // create execution plan
        const executionPlan = {};
        executionPlan.rootResource = { resourceId: this.props.parentResource, hasTabularData: rootNode };

        console.log('p1=createNewProperty(hasTabularData)');
        console.log('r1=createResourceObject(TabularData)');
        console.log('Link It >> ' + this.props.parentResource.resourceId + '-> p1-> r1');

        // r1 plan ;
        console.log('\tr1 Plan (for number of row nodes)');

        let it = 2;
        let numRows = 0;
        for (const name in rootNode) {
            console.log('\tp' + it + '= createNewProperty(hasRowData)');
            console.log('\tr' + it + '= createResourceObject(' + name + ')');
            it++;
            numRows++;
        }
        it = 2;
        for (const name in rootNode) {
            console.log('\tLink It >> r1 -> p' + it + ' -> r' + it);
            it++;
        }

        // plannig for the rowNodes;
        let currentResourceCounter = numRows + 2;
        for (let rI = 0; rI < numRows; rI++) {
            console.log('\t\tPlan rowNode' + rI + ' (r' + (rI + 2) + ')');
            const selector = 'rowNode' + rI;
            const nodeItem = rootNode[selector];
            console.log('\t\tpX = createNewProperty(method)');
            console.log('\t\tr' + currentResourceCounter++ + ' = createLiteralObject(' + nodeItem.method + ')');
            console.log('\t\tLink It >> r' + (rI + 2) + ' -> pY -> r' + (currentResourceCounter - 1));

            for (let cI = 0; cI < nodeItem.cellNodes.length; cI++) {
                console.log('\t\tpY = createNewProperty(hasCellNode)');
                console.log('\t\tr' + currentResourceCounter++ + ' = createResourceObject(CellNode_' + cI + ')');
                console.log('\t\tLink It >> r' + (rI + 2) + ' -> pY -> r' + (currentResourceCounter - 1));
                console.log('\t\t\tPlan cellNode' + cI + ' (r' + (currentResourceCounter - 1) + ')');
                let propCounter = 0;
                let valueCounter = 0;
                for (const name in nodeItem.cellNodes[cI]) {
                    console.log('\t\t\tpC' + propCounter + ' = createNewProperty(' + name + ')');
                    console.log('\t\t\trV' + valueCounter + ' = createLiteralObject(' + nodeItem.cellNodes[cI][name] + ')');
                    propCounter++;
                    valueCounter++;
                }
                for (let q = 0; q < propCounter; q++) {
                    console.log('\t\t\tLink It >> r' + (currentResourceCounter - 1) + ' -> pC' + q + ' -> rV' + q);
                }
            }
        }
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
    parentResource: PropTypes.any.isRequired
};

export default TableGenerator;
