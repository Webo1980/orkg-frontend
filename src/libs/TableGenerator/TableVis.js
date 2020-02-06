import React, { Component } from 'react';

import './tableView.css';
import MetricItem from './MetricItem';
import HeaderItem from './HeaderItem';
import Item from './Item';
import UnitItem from './UnitItem';
import PropTypes from 'prop-types';

class TableVis extends Component {
    constructor(props) {
        super(props);
        this.tableData = props.data;
        this.autoString = 'auto ';
        this.viewportUpdate = props.viewportUpdate;
        for (let x = 0; x < this.tableData.tableDimensionX; x++) {
            this.autoString += 'auto ';
        }

        this.gridRowStyleObject = {
            display: 'grid',

            gridTemplateColumns: this.autoString,
            backgroundColor: '#2196F3',
            padding: '0px'
        };

        console.log(this.gridRowStyleObject);
    }
    componentDidMount() {}

    componentDidUpdate = prevProps => {
        console.log(this.props);
        this.autoString = 'auto ';
        for (let x = 0; x < this.tableData.tableDimensionX; x++) {
            this.autoString += 'auto ';
        }

        this.gridRowStyleObject = {
            display: 'grid',
            gridTemplateColumns: this.autoString,
            backgroundColor: '#2196F3',
            padding: '0px'
        };

        // console.log(prevProps.data.tableDimensionX+ ' vs '+ this.tableData.tableDimensionX);
        // console.log(prevProps.data.tableDimensionY+ ' vs '+ this.tableData.tableDimensionY);
        console.log(prevProps.flip + ' vs ' + this.props.flip);
        if (prevProps.flip !== this.props.flip) {
            this.viewportUpdate(this.computeTableSize());
        }

        // if (this.viewportUpdate) {
        //
        // }
    };

    componentWillUnmount() {}

    buildHeaderRow = () => {
        const selectionArray = [];
        let selectionIndex = 0;
        // create two types;
        this.tableData.headerArray.forEach(headerItem => {
            selectionArray.push({ keyVal: 'headerEntry' + selectionIndex++, name: headerItem });
        });

        const visTypes = selectionArray.map(o => {
            return <div key={o.keyVal}>{o.name}</div>;
        });

        return visTypes;
    };
    buildMetricRow = () => {
        const selectionArray = [];
        let selectionIndex = 0;
        // create two types;
        this.tableData.metricArray.forEach(headerItem => {
            selectionArray.push({ keyVal: 'metricEntry' + selectionIndex++, name: headerItem });
        });

        const visTypes = selectionArray.map(o => {
            return <div key={o.keyVal}>{o.name}</div>;
        });

        return visTypes;
    };

    buildUnitsRow = () => {
        const selectionArray = [];
        let selectionIndex = 0;
        // create two types;
        this.tableData.unitArray.forEach(headerItem => {
            selectionArray.push({ keyVal: 'unitEntry' + selectionIndex++, name: headerItem });
        });

        const visTypes = selectionArray.map(o => {
            return <div key={o.keyVal}>{o.name}</div>;
        });

        return visTypes;
    };

    buildRow(array, rowIndex) {
        const items = [];
        let itemIndex = 0;
        // create two types;
        array.forEach(arrayItem => {
            items.push({ keyVal: 'valueEntry_' + rowIndex + '_' + itemIndex++, name: arrayItem });
        });

        const visTypes = items.map(o => {
            return <div key={o.keyVal}>{o.name}</div>;
        });
        // wrap it with row style; \
        const keyVal = 'rowIndex' + rowIndex;
        return (
            <div key={keyVal} style={{ display: 'flex' }}>
                {visTypes}
            </div>
        );
    }

    computeTableSize() {
        const numCols = this.tableData.headerArray.length;

        const numRows = this.tableData.valueArray[0] ? this.tableData.valueArray[0].length + 3 : 0;
        console.log('we have ' + numCols + ' ' + numRows);

        const size = { width: numCols * 190, height: numRows * 53 };
        console.log(size);
        return size;
    }

    buildColumns() {
        let colArray = [];
        let it = 0;
        const matrix = this.tableData.valueArray;
        matrix.forEach(col => {
            colArray = [].concat(colArray, this.buildSingleCol(col, it++));
        });
        return colArray;
    }

    buildSingleCol(valueArray, colIndex) {
        let it = 0;
        const itemsArray = [];
        const metricArray = [];
        const headerArray = [];
        const unitArray = [];
        metricArray.push({ keyVal: 'valueEntry_' + it++, name: this.tableData.metricArray[colIndex], mapIndex: colIndex });
        headerArray.push({ keyVal: 'valueEntry_' + it++, name: this.tableData.headerArray[colIndex], mapIndex: colIndex });
        unitArray.push({ keyVal: 'valueEntry_' + it++, name: this.tableData.unitArray[colIndex], mapIndex: colIndex });

        let rowIndex = 0;
        valueArray.forEach(val => {
            itemsArray.push({ keyVal: 'valueEntry_' + it++, name: val, colIndex: colIndex, rowIndex: rowIndex++ });
        });

        const metricMapped = metricArray.map(o => {
            return <MetricItem key={o.keyVal} mapIndex={o.mapIndex} tableData={this.tableData} className="grid-item" />;
        });

        const headerMapped = headerArray.map(o => {
            return <HeaderItem key={o.keyVal} mapIndex={o.mapIndex} tableData={this.tableData} className="grid-item" />;
        });

        const unitMapped = unitArray.map(o => {
            return <UnitItem key={o.keyVal} mapIndex={o.mapIndex} tableData={this.tableData} className="grid-item" />;
        });

        const mappedItems = itemsArray.map(o => {
            return <Item key={o.keyVal} colIndex={o.colIndex} rowIndex={o.rowIndex} tableData={this.tableData} className="grid-item" />;
        });

        let finalArray = [].concat(metricMapped, headerMapped);
        finalArray = [].concat(finalArray, mappedItems);
        finalArray = [].concat(finalArray, unitMapped);

        const rowColKey = 'columnIndex_' + colIndex;
        return (
            <div className="grid-col" key={rowColKey}>
                {finalArray}
            </div>
        );
    }

    /** Component Rendering Function **/
    render() {
        const columns = this.buildColumns();
        return <div style={this.gridRowStyleObject}>{columns}</div>;
    }
}
TableVis.propTypes = {
    flip: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    viewportUpdate: PropTypes.func.isRequired
};

export default TableVis;
