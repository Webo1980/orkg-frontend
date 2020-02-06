import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';

class UnitItem extends Component {
    constructor(props) {
        super(props);

        this.mapIndex = props.mapIndex;
        this.tableData = props.tableData;

        this.tableData.unitArray[this.mapIndex] = 'Percentage';
    }

    state = {
        unitSelectionOpen: false,
        selectedUnit: 'Percentage'
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
                    isOpen={this.state.unitSelectionOpen}
                    toggle={() => {
                        this.setState({ unitSelectionOpen: !this.state.unitSelectionOpen });
                    }}
                >
                    <DropdownToggle caret color="darkblue">
                        Unit : {this.state.selectedUnit}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            onClick={() => {
                                this.setState({ selectedUnit: 'Percentage' });
                                this.tableData.unitArray[this.mapIndex] = 'Percentage';
                            }}
                        >
                            Percentage
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }
}

UnitItem.propTypes = {
    mapIndex: PropTypes.any.isRequired,
    tableData: PropTypes.object.isRequired
};
export default UnitItem;
