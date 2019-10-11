import React, { Component } from 'react';
import { Alert } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { getPaperSummary } from './../../../network';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledPaperSummary = styled.div`
    border-color: #DFDFDF; /*don't use default color, since it is partially transparent $list-group-border-color;*/
    border-radius: ${props => props.theme.borderRadius};
    padding: 15px;
    border-style: solid;
    border-width: 2px;
    //box-shadow: -2px 0px 4px 0px rgba(0, 0, 0, 0.06);
    margin-top: -2px;
    margin-right: -2px;
    margin-bottom: -2px;
`;


class PaperSummary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            loadingSummaries: false,
            faildLoadingSummaries: false,
            paperSummaries: []
        };
    }

    componentDidMount() {
        this.fetchPaperSummaries();
    }

    fetchPaperSummaries = () => {
        this.setState({ loadingSummaries: true })
        if (this.props.abstract) {
            try {
                getPaperSummary({ text: this.props.abstract, method: 'textrank' }).then(result => {
                    this.setState({ paperSummaries: result.summary, loadingSummaries: false, faildLoadingSummaries: false })
                })
            } catch (e) {
                console.log(e);
                this.setState({ loadingSummaries: false, faildLoadingSummaries: true })
            }
        } else {
            this.setState({ loadingSummaries: false })
        }
    }

    render() {
        return (
            <StyledPaperSummary className={'mb-2'}>
                <h5>Paper summary</h5>
                {!this.state.loadingSummaries && !this.state.faildLoadingSummaries && (
                    this.props.abstract ? (
                        <div>
                            <Alert className={'mb-0'} color="info">
                                We've summarized the paper for you. You can use the summary as inspiration while adding data.
                            </Alert>
                            <ul className="m-0 mt-2 p-0 pl-3 pr-3">
                                {this.state.paperSummaries.map((s, index) => <li key={index}>{s}</li>)}
                            </ul>
                        </div>
                    ) : (
                            <Alert className={'mb-0'} color="info">
                                Please enter the abstract of your paper to use this feature.
                            </Alert>
                        )
                )}
                {!this.state.loadingSummaries && this.state.faildLoadingSummaries && (
                    <Alert className={'mb-0'} color="info">
                        <small>Failed to summarizer service.</small>
                    </Alert>
                )}
                {this.state.loadingSummaries && (
                    <div className="text-center mt-4 mb-4">
                        <span style={{ fontSize: 50 }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        Loading summary...
                    </div>
                )}

            </StyledPaperSummary>
        )
    }
}


PaperSummary.propTypes = {
    id: PropTypes.string.isRequired,
    abstract: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        abstract: state.addPaper.abstract,
    }
};

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PaperSummary);
