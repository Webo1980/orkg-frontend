import { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import styled from 'styled-components';
import { StyledHorizontalContribution } from './styled';
import BioassaySelectItem from './BioassaySelectItem';
import { isBioassay } from 'actions/addPaper';
import { connect } from 'react-redux';
import CsvReader from 'react-csv-reader';

// TODOS:
//  - Add check if submit text is empty
//  - add filepicker for .txt files

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

const PARSER_OPTIONS = {
    skipEmptyLines: true
};

class ContributionBioassay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submitText: '',
            isSubmitted: false,
            assayData: []
        };
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
    }

    componentWillUnmount() {
        // why doesnt this work?
        // this.props.isBioassay(false);
    }

    handleJsonToObject = () => {
        // Json object is a placeholder
        const json_data = {
            'Assay measurement type': 'endpoint assay',
            'Has assay footprint': '96 well plate',
            'Has assay format': ['biochemical format', 'cell-based format'],
            'Has assay method': ['colorimetric cell staining method', 'MTT reduction assay'],
            'Has assay phase characteristic': 'homogenous phase',
            'Has assay title': 'Cytotoxicity of compound against Vero E6 cells by MTT assay',
            'Has confirmatory assay': 'confirmatory assay',
            'Has endpoint': ['percent activity', 'percent cell viability'],
            'Has incubation time value': ['24h in DMEM 5% CO2', '48h in DMEM 2% FBS']
        };
        // get json from API when its ready
        const obj = JSON.parse(JSON.stringify(json_data));
        console.log(obj);
        this.setState({ assayData: obj });
    };

    handleSubmitText = () => {
        // check if text field is empty
        this.setState({ isSubmitted: true });
        this.handleJsonToObject();
    };

    handleOnFileLoaded = (data, fileInfo) => {
        this.setState({ submitText: data.join('\n') });
    };

    handleChangeEvent(event) {
        this.setState({ submitText: event.target.value });
    }

    render() {
        return (
            <StyledHorizontalContribution>
                <Form>
                    <Title style={{ marginTop: 0 }}>Contribution data</Title>
                    <div>
                        <FormGroup>
                            <div className="custom-file">
                                <CsvReader
                                    cssClass="btn"
                                    cssInputClass="custom-file-input "
                                    accept=".txt"
                                    onFileLoaded={this.handleOnFileLoaded}
                                    parserOptions={PARSER_OPTIONS}
                                    inputStyle={{ marginLeft: '5px' }}
                                />
                                <label className="custom-file-label" htmlFor="exampleCustomFileBrowser">
                                    Select a .txt file
                                </label>
                            </div>
                            <Label className="mt-2" for="exampleText">
                                Description
                            </Label>
                            <Input
                                type="textarea"
                                name="textInput"
                                placeholder="copy a text into this form or use the upload button"
                                rows="10"
                                onChange={this.handleChangeEvent}
                                value={this.state.submitText}
                            />
                        </FormGroup>
                        <div className="text-right">
                            <Button color="primary" className="mb-4" size="sm" onClick={this.handleSubmitText}>
                                Submit
                            </Button>
                        </div>
                    </div>
                    {this.state.isSubmitted && <BioassaySelectItem data={this.state.assayData} />}
                </Form>
            </StyledHorizontalContribution>
        );
    }
}

const mapStateToProps = state => {
    return {
        isBioassay: state.addPaper.isBioassay
    };
};

const mapDispatchToProps = dispatch => ({
    isBioassay: data => dispatch(isBioassay(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContributionBioassay);
