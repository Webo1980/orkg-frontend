import { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import styled from 'styled-components';
import { StyledHorizontalContribution } from './styled';
import BioassaySelectItem from './BioassaySelectItem';
import { isBioassay } from 'actions/addPaper';
import { connect } from 'react-redux';
import CsvReader from 'react-csv-reader';
import Contribution from './Contribution';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

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
            submitAlert: false,
            submitText: '',
            isSubmitted: false,
            assayData: [],
            selectionFinished: false,
            loadingData: false
        };
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
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
        this.setState({ assayData: obj });
    };

    handleSubmitText = () => {
        // console.log(this.state.submitText);
        if (this.state.submitText === '') {
            this.setState({ submitAlert: true });
        } else {
            this.setState({ submitAlert: false });
            this.setState({ isSubmitted: true });
            this.handleJsonToObject();
        }
    };

    handleOnFileLoaded = (data, fileInfo) => {
        console.log(data);
        this.setState({ submitText: data.join('\n') });
    };

    handleChangeEvent(event) {
        this.setState({ submitText: event.target.value });
    }

    handleFinishedSelection = () => {
        this.setState({ selectionFinished: true });
    };

    handleLoadingData = () => {
        this.setState({ loadingData: true });
    };

    render() {
        return (
            <div>
                {this.state.selectionFinished ? (
                    <Contribution id={this.props.id} />
                ) : (
                    <div>
                        {this.state.loadingData ? (
                            <div className="text-center text-primary">
                                <span style={{ fontSize: 80 }}>
                                    <Icon icon={faSpinner} spin />
                                </span>
                                <br />
                                <h2 className="h5">Loading...</h2> <br />
                            </div>
                        ) : (
                            <StyledHorizontalContribution>
                                <Form>
                                    <Title style={{ marginTop: 0 }}>Contribution data</Title>
                                    <div>
                                        <FormGroup>
                                            <div className="custom-file">
                                                <CsvReader
                                                    cssClass="csv-reader-input"
                                                    cssInputClass="custom-file-input "
                                                    accept=".txt"
                                                    onFileLoaded={this.handleOnFileLoaded}
                                                    parserOptions={PARSER_OPTIONS}
                                                    inputStyle={{ cursor: 'pointer' }}
                                                />
                                                <label className="custom-file-label" htmlFor="exampleCustomFileBrowser">
                                                    Click to upload bioassay .txt file
                                                </label>
                                            </div>
                                            <Label className="mt-2" for="exampleText">
                                                Description
                                            </Label>
                                            <Input
                                                type="textarea"
                                                name="textInput"
                                                id="textInput"
                                                placeholder="copy a text into this form or use the upload button"
                                                rows="10"
                                                onChange={this.handleChangeEvent}
                                                value={this.state.submitText}
                                            />
                                        </FormGroup>
                                        {this.state.submitAlert && <Label>Nothing to submit. Please provide text in the input field</Label>}
                                        <div className="text-right">
                                            <Button color="primary" className="mb-4" size="sm" onClick={this.handleSubmitText}>
                                                Submit
                                            </Button>
                                        </div>
                                    </div>
                                    {this.state.isSubmitted && !this.state.submitAlert && (
                                        <BioassaySelectItem
                                            data={this.state.assayData}
                                            id={this.props.selectedResource}
                                            selectionFinished={this.handleFinishedSelection}
                                            loadingData={this.handleLoadingData}
                                        />
                                    )}
                                </Form>
                            </StyledHorizontalContribution>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

ContributionBioassay.propTypes = {
    id: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
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
