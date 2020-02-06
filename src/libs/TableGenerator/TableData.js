export default class TableData {
    constructor() {
        this.tableDimensionX = 0;
        this.tableDimensionY = 0;
        this.headerArray = [];
        this.valueArray = [];
        this.metricArray = [];
        this.unitArray = [];

        this.showTable = this.showTable.bind(this);
        this.addRow = this.addRow.bind(this);
        this.addCol = this.addCol.bind(this);

        this.updateEventFunction = this.updateEventFunction.bind(this);
        this._updateEvent = null;
    }

    updateEventFunction(func) {
        this._updateEvent = func;
    }

    addRow() {
        if (this.tableDimensionX === 0 && this.tableDimensionY === 0) {
            this.tableDimensionY++;
            this.addCol();
        } else {
            this.tableDimensionY++;
            // go through all entries and add there stuff;
            this.valueArray.forEach(item => {
                item.push('<<empty>>');
            });
        }
        this._updateEvent();
    }

    addCol() {
        if (this.tableDimensionX === 0 && this.tableDimensionY === 0) {
            this.tableDimensionY++;
        }
        this.tableDimensionX++;
        this.headerArray.push('Header');
        this.metricArray.push('Metric');
        this.unitArray.push('Unit');
        this.valueArray.push(new Array(this.tableDimensionY).fill('<<empty>>'));
        this._updateEvent();
    }

    showTable() {
        console.log('want to show the table');
        console.log(this.metricArray);
        console.log(this.headerArray);
        console.log(this.valueArray);
        console.log(this.unitArray);
    }
}
