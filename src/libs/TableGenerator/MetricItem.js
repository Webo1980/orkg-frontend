import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
class MetricItem extends Component {
    constructor(props) {
        super(props);

        this.mapIndex = props.mapIndex;
        this.tableData = props.tableData;
    }

    state = {
        metricSelectionOpen: false,
        selectedMapper: 'Metric'
    };

    componentDidMount() {}

    componentDidUpdate = prevProps => {};

    componentWillUnmount() {}

    render() {
        return (
            <div className="grid-item">
                <Dropdown
                    color="darkblue"
                    size="sm"
                    //    className='mb-4 mt-4'
                    style={{ margin: '0 10px', flexGrow: '1', display: 'flex' }}
                    isOpen={this.state.metricSelectionOpen}
                    toggle={() => {
                        this.setState({ metricSelectionOpen: !this.state.metricSelectionOpen });
                    }}
                >
                    <DropdownToggle caret color="darkblue">
                        Map to : {this.state.selectedMapper}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            onClick={() => {
                                this.setState({ selectedMapper: 'None' });
                                this.tableData.metricArray[this.mapIndex] = 'None';
                            }}
                        >
                            None
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => {
                                this.setState({ selectedMapper: 'Metric' });
                                this.tableData.metricArray[this.mapIndex] = 'Metric';
                            }}
                        >
                            Metric
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }
}
MetricItem.propTypes = {
    mapIndex: PropTypes.any.isRequired,
    tableData: PropTypes.object.isRequired
};

export default MetricItem;
