import { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import styled from 'styled-components';
import { StyledHorizontalContribution } from './styled';
import BioassaySelectItem from './BioassaySelectItem';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

class ContributionBioassay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submitText: 'copy text or use upload',
            isSubmitted: false
        };
    }

    handleLoadTextFile = filepath => {
        // open file
    };

    handleSubmitText = () => {
        this.setState({ isSubmitted: true });
    };

    render() {
        return (
            <StyledHorizontalContribution>
                <Form>
                    <Title style={{ marginTop: 0 }}>Contribution data</Title>
                    <FormGroup>
                        <Label for="exampleText">Description</Label>
                        <Button color="secondary" className="float-right mb-4" size="sm">
                            Upload text file ...
                        </Button>
                        <Input type="textarea" name="text" id="exampleText" placeholder={this.state.submitText} />
                    </FormGroup>
                    <Button color="primary" className="float-right mb-4" size="sm" onClick={this.handleSubmitText}>
                        Submit
                    </Button>
                    {this.state.isSubmitted && <BioassaySelectItem />}
                </Form>
            </StyledHorizontalContribution>
        );
    }
}

// props + connect
export default ContributionBioassay;
