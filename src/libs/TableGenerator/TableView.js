import React, { Component } from 'react';
import TableData from './TableData';
import TableVis from './TableVis';
import { Button, InputGroupAddon } from 'reactstrap';
import PropTypes from 'prop-types';
class TableView extends Component {
    constructor(props) {
        super(props);

        this.state = { flipUpdateFlag: false };
        this.tableData = new TableData();
        this.emitUpdateFromTableData = this.emitUpdateFromTableData.bind(this);
        this.viewportUpdateFunction = props.viewportUpdate;
        this.killTheTable = props.killTheTable;
        this.insertTableIntoGraph = props.insertTableIntoGraph;

        this.tableData.updateEventFunction(this.emitUpdateFromTableData);
    }

    componentDidMount() {
        // owerwritng Cntrl+E event ;
    }

    componentDidUpdate = prevProps => {};

    componentWillUnmount() {}

    emitUpdateFromTableData() {
        console.log(this);
        this.setState({ flipUpdateFlag: !this.state.flipUpdateFlag });
    }

    addColFunction = () => {
        console.log('yeah we want to add a col');
        this.tableData.addCol();
        this.tableData.showTable();
    };

    addRowFunction = () => {
        console.log('yeah we want to add a row');
        this.tableData.addRow();
        this.tableData.showTable();
    };

    buildSemanticTable = () => {
        this.tableData.showTable();

        // we work using row selection ;

        const rootNode = {};
        if (this.tableData.valueArray) {
            for (let i = 0; i < this.tableData.valueArray[0].length; i++) {
                rootNode['rowNode' + i] = { method: 'notSetYet', cellNodes: [] };
            }

            for (let i = 0; i < this.tableData.valueArray.length; i++) {
                // apply the methods;
                //' pseudore mapping to method'
                if (this.tableData.metricArray[i] !== 'Metric') {
                    // then this is a method;
                    for (let j = 0; j < this.tableData.valueArray[i].length; j++) {
                        const selector = 'rowNode' + j;
                        rootNode[selector].method = this.tableData.valueArray[i][j];
                    }
                }
            }
            // create the cell nodes
            for (let i = 0; i < this.tableData.valueArray.length; i++) {
                // apply the methods;
                //' pseudore mapping to method'
                if (this.tableData.metricArray[i] === 'Metric') {
                    // then this is a method;
                    for (let j = 0; j < this.tableData.valueArray[i].length; j++) {
                        const selector = 'rowNode' + j;
                        const cellObject = {};
                        cellObject.hasMetric = this.tableData.headerArray[i];
                        cellObject.hasUnit = this.tableData.unitArray[i];
                        cellObject.hasValue = this.tableData.valueArray[i][j];
                        rootNode[selector].cellNodes.push(cellObject);
                    }
                }
            }

            console.log(rootNode);

            this.insertTableIntoGraph(rootNode);
        }
    };

    /** Component Rendering Function **/
    render() {
        return (
            <div style={{ width: this.props.size.width, height: this.props.size.height }}>
                <div style={{ minWidth: '400px', width: '100%', height: '30px', display: 'flex', backgroundColor: '#f8f9fb' }}>
                    <InputGroupAddon addonType="append" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
                        <Button color="light" className={'addPropertyActionButton'} onClick={this.buildSemanticTable}>
                            Build
                        </Button>
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append" style={{ paddingRight: '5px' }}>
                        <Button color="light" className={'addPropertyActionButton'} onClick={this.killTheTable}>
                            Cancel
                        </Button>
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append" style={{ paddingRight: '5px' }}>
                        <Button color="light" className={'addPropertyActionButton'} onClick={this.addRowFunction}>
                            Add Row
                        </Button>
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append">
                        <Button color="light" className={'addPropertyActionButton'} onClick={this.addColFunction}>
                            Add Col
                        </Button>
                    </InputGroupAddon>
                </div>
                <div style={{ width: '100%', height: '100%', display: 'flex' }}>
                    <div id="tableView" style={{ width: this.props.size.width, height: this.props.size.height, backgroundColor: 'green' }}>
                        <TableVis viewportUpdate={this.viewportUpdateFunction} data={this.tableData} flip={this.state.flipUpdateFlag} />{' '}
                    </div>
                    {/*<div*/}
                    {/*    id="addCol"*/}
                    {/*    onClick={this.addColFunction}*/}
                    {/*    style={{ width: '50px', height: this.props.size.height - 50, backgroundColor: 'red' }}*/}
                    {/*>*/}
                    {/*    +*/}
                    {/*</div>*/}
                </div>
                {/*<div style={{ width: '100%', height: '100%' }}>*/}
                {/*    <div*/}
                {/*        id="addCol"*/}
                {/*        onClick={this.addRowFunction}*/}
                {/*        style={{ width: this.props.size.width - 50, height: '30px', backgroundColor: 'blue', position: 'relative', bottom: '80px' }}*/}
                {/*    >*/}
                {/*        Add Row{' '}*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        );
    }
}

TableView.propTypes = {
    viewportUpdate: PropTypes.func.isRequired,
    killTheTable: PropTypes.func.isRequired,
    insertTableIntoGraph: PropTypes.func.isRequired,
    size: PropTypes.object.isRequired
};

export default TableView;
