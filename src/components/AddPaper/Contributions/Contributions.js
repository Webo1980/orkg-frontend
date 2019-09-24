import React, { Component } from 'react';
import { Row, Col, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../Utils/Tooltip';
import { StyledHorizontalContentEditable, StyledHorizontalContributionsList, StyledRelatedData, StyledRelatedList } from './styled';
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
import RelatedProperty from './RelatedProperty';
import RelatedValue from './RelatedValue';
import RelatedContribution from './RelatedContribution';
import { getStatementsByPredicate, getStatementsBySubject, getStatementsByObject } from './../../../network';


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
            activeTab: '1',
            relatedProperties: [
                {
                    label: 'Has evaluation',
                    id: 'HAS_EVALUATION'
                },
                {
                    label: 'Has approach',
                    id: 'HAS_APPROACH'
                },
                {
                    label: 'Has method',
                    id: 'HAS_METHOD'
                },
                {
                    label: 'Has implementation',
                    id: 'HAS_IMPLEMENTATION'
                },
                {
                    label: 'Has result',
                    id: 'HAS_RESULTS'
                },
                {
                    label: 'Has value',
                    id: 'HAS_VALUE'
                }
                ,
                {
                    label: 'Has metric',
                    id: 'HAS_METRIC'
                }
            ],
            relatedValues: [],
            relatedContributions: []
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
            this.getRelatedContributions();
        }
    }

    componentDidUpdate = (prevProps) => {
        // Get new related properties
        if (this.props.selectedResource !== prevProps.selectedResource) {
            this.getRelatedProperties();
        }
        // Get new related values
        if (this.props.selectedProperty !== prevProps.selectedProperty) {
            this.getRelatedValues();
        }
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    getRelatedContributions = () => {
        if (
            this.props.selectedResearchField
        ) {
            // Get the statements that contains the research field as an object
            getStatementsByObject({
                id: this.props.selectedResearchField,
                limit: 4,
                order: 'desc',
            }).then((result) => {
                // Papers
                // Fetch the data of each paper
                let papers = result.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD)
                    .map((paper) => {
                        return getStatementsBySubject(paper.subject.id).then((paperStatements) => {
                            // publication year
                            let publicationYear = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);
                            if (publicationYear.length > 0) {
                                publicationYear = publicationYear[0].object.label
                            } else {
                                publicationYear = ''
                            }
                            // publication month
                            let publicationMonth = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);
                            if (publicationMonth.length > 0) {
                                publicationMonth = publicationMonth[0].object.label
                            } else {
                                publicationMonth = ''
                            }
                            // authors
                            let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);
                            let authorNamesArray = [];
                            if (authors.length > 0) {
                                for (let author of authors) {
                                    let authorName = author.object.label;
                                    authorNamesArray.push(authorName);
                                }
                            }
                            // contributions
                            let contributions = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION);

                            let contributionArray = [];

                            if (contributions.length > 0) {
                                for (let contribution of contributions) {
                                    let statements = getStatementsBySubject(contribution.object.id);
                                    Promise.all([statements]).then(cs => {
                                        let st = { properties: [], values: [] };
                                        let createdProperties = {};
                                        if (cs[0].length > 0) {
                                            cs[0].map(s => {
                                                if (!createdProperties[s.predicate.id]) {
                                                    createdProperties[s.predicate.id] = s.predicate.id;
                                                    st['properties'].push({
                                                        propertyId: s.predicate.id,
                                                        existingPredicateId: s.predicate.id,
                                                        label: s.predicate.label,
                                                    });
                                                }
                                                st['values'].push({
                                                    label: s.object.label,
                                                    type: 'object',
                                                    propertyId: s.predicate.id,
                                                    existingResourceId: s.object.id,
                                                });
                                            });
                                            contributionArray.push({
                                                ...contribution.object,
                                                statements: st
                                            });
                                        }
                                    })
                                }
                            }
                            paper.data = {
                                publicationYear,
                                publicationMonth,
                                authorNames: authorNamesArray.reverse(),
                                contributions: contributionArray.sort((a, b) => a.label.localeCompare(b.label)), // sort contributions ascending, so contribution 1, is actually the first one
                            }
                            return paper;
                        })
                    });
                return Promise.all(papers).then((papers) => {
                    this.setState({
                        relatedContributions: papers.map(p => { return { title: p.subject.label, id: p.subject.id, ...p.data } })
                    })
                })
            });
        }
    }


    getRelatedProperties = () => {
        if (
            this.props.selectedResource
            && this.props.resources.byId[this.props.selectedResource]
            && this.props.resources.byId[this.props.selectedResource].existingResourceId
        ) {
            getStatementsBySubject(this.props.resources.byId[this.props.selectedResource].existingResourceId).then((result) => {
                // Get the related properties without duplicates
                var relatedProperties = result.map((statement) => {
                    return statement.predicate
                }).filter((relatedProperty, index, self) =>
                    index === self.findIndex((t) => (
                        t.id === relatedProperty.id && t.label === relatedProperty.label
                    ))
                )
                // Set them to the list of related properties
                this.setState({
                    relatedProperties: relatedProperties,
                    loading: false,
                    activeTab: '2'
                })
            })
        }
    }

    getRelatedValues = () => {
        if (
            this.props.selectedProperty
            && this.props.properties.byId[this.props.selectedProperty]
            && this.props.properties.byId[this.props.selectedProperty].existingPredicateId
        ) {
            getStatementsByPredicate(this.props.properties.byId[this.props.selectedProperty].existingPredicateId).then((result) => {
                // Get the related values without duplicates
                var relatedValues = result.map((statement) => {
                    return statement.object
                }).filter((relatedValue, index, self) =>
                    index === self.findIndex((t) => (
                        t.id === relatedValue.id && t.label === relatedValue.label
                    ))
                )
                // Set them to the list of related values
                this.setState({
                    relatedValues: relatedValues,
                    loading: false,
                    activeTab: '3'
                })
            })
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

    droppedProperty = (id) => {
        this.setState({
            relatedProperties: this.state.relatedProperties.filter(obj => obj.id !== id)
        })
    }

    droppedValue = (id) => {
        this.setState({
            relatedValues: this.state.relatedValues.filter(obj => obj.id !== id)
        })
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
                                                <UncontrolledButtonDropdown direction="right">
                                                    <DropdownToggle color="link">
                                                        <Icon icon={faCog} />
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
                        <StyledRelatedList id="contributionsList">
                            <li key={1}
                                onClick={() => { this.toggle('1'); }}
                                className={this.state.activeTab === '1' ? 'activeRelated' : ''}
                            >
                                <span>Similar</span>
                            </li>
                            <li key={2}
                                onClick={() => { this.toggle('2'); }}
                                className={this.state.activeTab === '2' ? 'activeRelated' : ''}
                            >
                                <span>Properties</span>
                            </li>
                            <li
                                key={3}
                                onClick={() => { this.toggle('3'); }}
                                className={this.state.activeTab === '3' ? 'activeRelated' : ''}
                            >
                                <span>Values</span>
                            </li>
                        </StyledRelatedList>

                        {this.state.activeTab === '1' && (
                            <StyledRelatedData>
                                {this.state.relatedContributions.map((p) => <RelatedContribution dropped={this.droppedProperty} key={`s${p.id}`} id={p.id} label={p.title} contributions={p.contributions} />)}
                            </StyledRelatedData>
                        )}

                        {this.state.activeTab === '2' && (
                            <StyledRelatedData>
                                {this.state.relatedProperties.map((p) => <RelatedProperty dropped={this.droppedProperty} key={`s${p.id}`} id={p.id} label={p.label} />)}
                            </StyledRelatedData>
                        )}

                        {this.state.activeTab === '3' && (
                            <StyledRelatedData>
                                {this.state.relatedValues.map((v) => <RelatedValue dropped={this.droppedValue} ey={`s${v.id}`} id={v.id} label={v.label} />)}
                            </StyledRelatedData>
                        )}
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
    selectedProperty: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
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
        values: state.statementBrowser.values,
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
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
    updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data)),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies
)(Contributions);