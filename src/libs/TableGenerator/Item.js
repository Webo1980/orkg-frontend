import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Item extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.rowIndex = props.rowIndex;
        this.colIndex = props.colIndex;
        this.tableData = props.tableData;

        this.tableData.headerArray[this.mapIndex] = this.state.value;
    }

    state = {
        value: ''
    };

    componentDidMount() {}

    componentDidUpdate = prevProps => {};

    componentWillUnmount() {}

    handleChange(event) {
        this.setState({ value: event.target.value });
        this.tableData.valueArray[this.colIndex][this.rowIndex] = event.target.value;
    }
    render() {
        return (
            <div className="grid-item">
                <input
                    style={{ width: '100%', fontSize: '16px' }}
                    type="text"
                    placeholder="<<empty>>"
                    value={this.state.value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

Item.propTypes = {
    rowIndex: PropTypes.any.isRequired,
    colIndex: PropTypes.any.isRequired,
    tableData: PropTypes.object.isRequired
};
export default Item;
