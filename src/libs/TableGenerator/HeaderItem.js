import React, { Component } from 'react';
import PropTypes from 'prop-types';

class HeaderItem extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.mapIndex = props.mapIndex;
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
        this.tableData.headerArray[this.mapIndex] = event.target.value;
    }

    render() {
        return (
            <div className="grid-item">
                <input
                    style={{ width: '100%', fontSize: '16px' }}
                    type="text"
                    placeholder="Header"
                    value={this.state.value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

HeaderItem.propTypes = {
    mapIndex: PropTypes.any.isRequired,
    tableData: PropTypes.object.isRequired
};

export default HeaderItem;
