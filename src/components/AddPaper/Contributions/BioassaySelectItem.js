import { Component } from 'react';
import { FormGroup, Label, ListGroup } from 'reactstrap';

class BioassaySelectItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            csv_data: undefined
        };
    }

    handleLoadStatements = () => {
        // map object data to jsx
    };

    render() {
        return (
            <FormGroup>
                <Label>Property Value</Label>
            </FormGroup>
        );
    }
}

export default BioassaySelectItem;
