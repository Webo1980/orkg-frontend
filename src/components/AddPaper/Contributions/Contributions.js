import React, { Component } from 'react';
import {
    Row, Col, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../Utils/Tooltip';
import SimilarContributionData from './SimilarContributionData'
import { StyledHorizontalContentEditable, StyledHorizontalContributionsList } from './styled';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
    nextStep, previousStep, createContribution, deleteContribution,
    selectContribution, updateContributionLabel, saveAddPaper, openTour,
    updateTourCurrentStep
} from '../../../actions/addPaper';
import Confirm from 'reactstrap-confirm';
import Contribution from './Contribution';
import { CSSTransitionGroup } from 'react-transition-group'
import styled, { withTheme } from 'styled-components';
import { withCookies } from 'react-cookie';
import PropTypes from 'prop-types';


const AnimationContainer = styled.div`
    transition: 0.3s background-color,  0.3s border-color;

    &.fadeIn-enter {
        opacity:0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity:1;
        transition:0.5s opacity;
    }
`;

class Contributions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editing: {},
        };
        this.inputRefs = {}
    }

    componentDidMount() {
        // if there is no contribution yet, create the first one
        if (this.props.contributions.allIds.length === 0) {
            this.props.createContribution({
                selectAfterCreation: true,
                prefillStatements: true,
                researchField: this.props.selectedResearchField,
            });
        }
    }

    handleNextClick = async () => {
        let result = await Confirm({
            title: (
                <div>
                    Are you sure you want to save this paper?
                </div>
            ),
            message: (
                <div>
                    You will no longer be able to edit this paper once it's saved!<br />
                </div>
            ),
            confirmText: 'Save and lock',
            cancelColor: 'light'
        });
        //
        if (result) {
            // save add paper 
            this.props.saveAddPaper({
                title: this.props.title,
                authors: this.props.authors,
                publicationMonth: this.props.publicationMonth,
                publicationYear: this.props.publicationYear,
                doi: this.props.doi,
                selectedResearchField: this.props.selectedResearchField,
                contributions: this.props.contributions,
                resources: this.props.resources,
                properties: this.props.properties,
                values: this.props.values,
            });
            this.props.nextStep();
        }
    }

    toggleDeleteContribution = async (id) => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            this.props.deleteContribution(id);
        }
    }

    toggleEditLabelContribution = (contributionId, e) => {
        if (this.state.editing[contributionId]) {
            this.setState({ editing: { ...this.state.editing, [contributionId]: false } })
        } else {
            // enable editing and focus on the input
            this.setState({ editing: { ...this.state.editing, [contributionId]: true } }, () => { this.inputRefs[contributionId].focus(); })
        }
    };

    pasteAsPlainText = event => {
        event.preventDefault()
        const text = event.clipboardData.getData('text/plain')
        document.execCommand('insertHTML', false, text)
    }

    handleSelectContribution = (contributionId) => {
        const resourceId = this.props.contributions.byId[contributionId].resourceId;

        this.props.selectContribution({
            id: contributionId,
            resourceId
        });
    }

    handleChange = (contributionId, e) => {
        this.props.updateContributionLabel({
            label: e.target.value,
            contributionId: contributionId,
        });
    };

    handleLearnMore = (step) => {
        this.props.openTour(step);
    }

    render() {
        let selectedResourceId = this.props.selectedContribution;

        return (
            <div>
                <h2 className="h4 mt-4 mb-5"><Tooltip message={<span>Specify the research contributions that this paper makes. A paper can have multiple contributions and each contribution addresses at least one research problem. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.handleLearnMore(1)}>Learn more</span></span>}>Specify research contributions</Tooltip></h2>
                <Row>
                    <div className="col-8">
                        <StyledHorizontalContributionsList id="contributionsList">
                            {this.props.contributions.allIds.map((contribution, index) => {
                                let contributionId = this.props.contributions.byId[contribution]['id'];
                                return (
                                    <li
                                        className={contributionId === this.props.selectedContribution ? 'activeContribution' : ''}
                                        key={contributionId}
                                        onClick={() => this.handleSelectContribution(contributionId)}
                                    >
                                        <StyledHorizontalContentEditable
                                            innerRef={(input) => { this.inputRefs[contribution] = input; }}
                                            html={this.props.contributions.byId[contribution]['label']}
                                            disabled={!this.state.editing[contribution]}
                                            onChange={(e) => this.handleChange(contributionId, e)}
                                            tagName="span"
                                            onPaste={this.pasteAsPlainText}
                                            onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                            onBlur={(e) => this.toggleEditLabelContribution(contributionId)}
                                            onFocus={(e) => setTimeout(() => { document.execCommand('selectAll', false, null) }, 0)} // Highlights the entire label when edit
                                        />
                                        {!this.state.editing[contribution] && contributionId === this.props.selectedContribution && (
                                            <>
                                                <UncontrolledButtonDropdown direction="down">
                                                    <DropdownToggle className={'dropdownToggle'} color="link" size="sm" >
                                                        <Icon icon={faCog} color={'#fff'} />
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem onClick={(e) => this.toggleEditLabelContribution(contributionId, e)}>
                                                            <Icon icon={faPen} /> Edit the contribution label
                                                        </DropdownItem>
                                                        {this.props.contributions.allIds.length !== 1 && (
                                                            <DropdownItem onClick={() => this.toggleDeleteContribution(contributionId)}>
                                                                <Icon icon={faTrash} /> Delete contribution
                                                            </DropdownItem>
                                                        )}
                                                    </DropdownMenu>
                                                </UncontrolledButtonDropdown>
                                            </>
                                        )}
                                    </li>
                                )
                            })}
                            <li className={'addContribution text-primary'}>
                                <span onClick={this.props.createContribution}><Icon icon={faPlus} /></span>
                            </li>
                        </StyledHorizontalContributionsList>
                        <CSSTransitionGroup
                            transitionName="fadeIn"
                            transitionEnterTimeout={500}
                            transitionLeave={false}
                            component="div"
                            style={{}}
                        >
                            <AnimationContainer
                                key={selectedResourceId}
                            >
                                <Contribution id={selectedResourceId} />
                            </AnimationContainer>
                        </CSSTransitionGroup>
                    </div>
                    <Col xs="4">
                        <SimilarContributionData />
                    </Col>
                </Row>
                <hr className="mt-5 mb-3" />
                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Finish</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>Previous step</Button>
            </div >
        );
    }
}

Contributions.propTypes = {
    title: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    publicationMonth: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    publicationYear: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    doi: PropTypes.string.isRequired,
    selectedResearchField: PropTypes.string.isRequired,
    contributions: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    createContribution: PropTypes.func.isRequired,
    deleteContribution: PropTypes.func.isRequired,
    selectContribution: PropTypes.func.isRequired,
    updateContributionLabel: PropTypes.func.isRequired,
    saveAddPaper: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    openTour: PropTypes.func.isRequired,
    updateTourCurrentStep: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        title: state.addPaper.title,
        authors: state.addPaper.authors,
        publicationMonth: state.addPaper.publicationMonth,
        publicationYear: state.addPaper.publicationYear,
        doi: state.addPaper.doi,
        selectedResearchField: state.addPaper.selectedResearchField,
        contributions: state.addPaper.contributions,
        selectedContribution: state.addPaper.selectedContribution,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values
    }
};

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    createContribution: (data) => dispatch(createContribution(data)),
    deleteContribution: (id) => dispatch(deleteContribution(id)),
    selectContribution: (id) => dispatch(selectContribution(id)),
    updateContributionLabel: (data) => dispatch(updateContributionLabel(data)),
    saveAddPaper: (data) => dispatch(saveAddPaper(data)),
    openTour: (data) => dispatch(openTour(data)),
    updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies
)(Contributions);