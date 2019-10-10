import React, { Component } from 'react'
import { Row, Col, Button, Nav, NavItem, NavLink, TabContent, TabPane, Input } from 'reactstrap';
import RelatedProperty from './RelatedProperty';
import RelatedValue from './RelatedValue';
import RelatedContribution from './RelatedContribution';
import RelatedContributionCarousel from './RelatedContributionCarousel'
import classnames from 'classnames';
import StatementBrowserDialog from './../../StatementBrowser/StatementBrowserDialog';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { StyledRelatedData } from './styled';
import { prefillStatements, resetSelectedDndProperties, resetSelectedDndValues } from '../../../actions/addPaper';
import {
    getStatementsByPredicate, getStatementsBySubject, getStatementsByObject,
    submitGetRequest, predicatesUrl, resourcesUrl
} from './../../../network';
import { guid } from '../../../utils';
import PropTypes from 'prop-types';

class SimilarContributionData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            searchSimilarContribution: '',
            searchSimilarValue: '',
            searchSimilarProperty: '',
            loadingSimilarContribution: false,
            loadingSimilarValue: false,
            loadingSimilarProperty: false,
            modal: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
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
    }

    componentDidMount() {
        // Get similar contributions
        this.getRelatedContributions();
    }

    componentDidUpdate = (prevProps) => {
        // Get new related properties
        if (this.props.selectedResource !== prevProps.selectedResource) {
            this.getRelatedProperties(this.state.searchSimilarProperty);
        }
        // Get new related values
        if (this.props.selectedProperty !== prevProps.selectedProperty) {
            this.getRelatedValues(this.state.searchSimilarValue);
        }
        // Get new similar contribution
        if (this.props.researchProblems !== prevProps.researchProblems) {
            this.getRelatedContributions(this.state.searchSimilarContribution);
        }
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    toggleModal = () => {
        this.setState((prevState) => ({
            modal: !prevState.modal,
        }));
    };

    handleViewRelatedContributionClick = (ressourceID, ressourceLabel) => {
        this.setState({
            modal: true,
            dialogResourceId: ressourceID,
            dialogResourceLabel: ressourceLabel,
        });
    };

    getContributionData = (contributionID) => {
        // Fetch contribution data
        return getStatementsBySubject(contributionID).then((contributionStatements) => {
            // remove research problem statement
            let filtredContributionStatements = contributionStatements.filter((statement) => statement.predicate.id !== process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM)
            let st = { properties: [], values: [] };
            let createdProperties = {};
            if (filtredContributionStatements.length > 0) {
                filtredContributionStatements.map(s => {
                    if (!createdProperties[s.predicate.id]) {
                        createdProperties[s.predicate.id] = guid();
                        st['properties'].push({
                            propertyId: createdProperties[s.predicate.id],
                            existingPredicateId: s.predicate.id,
                            label: s.predicate.label,
                        });
                    }
                    st['values'].push({
                        label: s.object.label,
                        type: 'object',
                        propertyId: createdProperties[s.predicate.id],
                        id: s.object.id,
                    });
                    return true;
                });

                return {
                    ...filtredContributionStatements[0].subject,
                    statements: st
                }
            } else {
                return null;
            }
        })
    }

    getPaperData = (paperID) => {
        return getStatementsBySubject(paperID).then(async (paperStatements) => {
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
                contributionArray = contributions.map((c) => {
                    return this.getContributionData(c.object.id)
                })
            } else {
                return null;
            }

            return Promise.all(contributionArray).then((contributionsData) => {
                let filteredContributionData = contributionsData.filter(function (el) { return el != null });
                if (filteredContributionData.length > 0) {
                    let paper = {
                        id: paperID,
                        label: paperStatements[0].subject.label,
                        authorNames: authorNamesArray.reverse(),
                        contributions: filteredContributionData.sort((a, b) => a.label.localeCompare(b.label)), // sort contributions ascending, so contribution 1, is actually the first one
                    }
                    return paper;
                } else {
                    return null
                }
            })
        })
    }

    getRelatedContributions = (searchQuery) => {
        this.setState({ loadingSimilarContribution: true })
        if (searchQuery && searchQuery !== '') {
            getStatementsByObject({
                id: process.env.REACT_APP_RESOURCE_TYPES_PAPER,
                order: 'desc',
            }).then((papers) => {
                // Fetch the data of each paper
                var papers_data = papers.map((paper) => {
                    return this.getPaperData(paper.subject.id);
                });
                return Promise.all(papers_data).then((papers) => {
                    this.setState({
                        loadingSimilarContribution: false,
                        relatedContributions: papers.filter(function (el) { return el != null && el.contributions != null && el.contributions.length > 0; }).filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())).map(p => { return { title: p.label, ...p } })
                    })
                })
            });
        } else if (this.props.researchProblems.length > 0) {
            console.log(this.props.researchProblems);
            /*
                // Get the contributions that are on the research problem
                getStatementsByObject({
                    id: this.props.researchProblems[0],
                    order: 'desc',
                }).then((result) => {
                    // Get the papers of each contribution
                    var papers = result.map((contribution) => {
                        return getStatementsByObject({ id: contribution.subject.id, order: 'desc' }).then((papers) => {
                            // Fetch the data of each paper
                            var papers_data = papers.map((paper) => {
                                return getStatementsBySubject(paper.subject.id).then((paperStatements) => {
                                    // authors
                                    let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);
                                    let authorNamesArray = [];
                                    if (authors.length > 0) {
                                        for (let author of authors) {
                                            let authorName = author.object.label;
                                            authorNamesArray.push(authorName);
                                        }
                                    }
                                    paper.data = {
                                        authorNames: authorNamesArray.reverse(),
                                    }
                                    return paper;
                                })
                            });
                            return Promise.all(papers_data).then((results) => {
                                contribution.papers = results;
                                return contribution.papers.length > 0 ? contribution : null
                            })
                        });
                    })
     
                    Promise.all(papers).then((results) => {
     
                        console.log(results);
     
                        this.setState({
                            contributions: results,
                            loading: false
                        })
                    })
                })
            */
        } else if (this.props.selectedResearchField) {
            // Get the statements that contains the research field as an object
            getStatementsByObject({
                id: this.props.selectedResearchField,
                limit: 4,
                order: 'desc',
            }).then((result) => {
                // Papers
                // Fetch the data of each paper
                return result.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD)
                    .map(async (paper) => {
                        return await this.getPaperData(paper.subject.id);
                    });
            }).then((papers) => {
                return Promise.all(papers).then((papersData) => {
                    this.setState({
                        loadingSimilarContribution: false,
                        relatedContributions: papersData.filter(function (el) { return el != null && el.contributions != null && el.contributions.length > 0; }).map(p => { return { title: p.label, ...p } })
                    })
                })
            });
        }
        this.setState({ loadingSimilarContribution: false })
    }


    getRelatedProperties = (searchQuery) => {
        this.setState({ loadingSimilarProperty: true })
        if (searchQuery && searchQuery !== '') {
            // reset selected properties
            this.props.resetSelectedDndProperties();
            submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(searchQuery)).then((relatedProperties) => {
                this.setState({
                    loadingSimilarProperty: false,
                    relatedProperties: relatedProperties
                })
            })
        } else if (
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
                // reset selected properties
                this.props.resetSelectedDndProperties();
                // Set them to the list of related properties
                this.setState({
                    loadingSimilarProperty: false,
                    relatedProperties: relatedProperties,
                    loading: false,
                    activeTab: '2'
                })
            })
        }
        this.setState({ loadingSimilarProperty: false })
    }

    getRelatedValues = (searchQuery) => {
        this.setState({ loadingSimilarValue: true })
        if (searchQuery && searchQuery !== '') {
            // reset selected values
            this.props.resetSelectedDndValues();
            submitGetRequest(resourcesUrl + '?q=' + encodeURIComponent(searchQuery)).then((relatedValues) => {
                this.setState({
                    loadingSimilarValue: false,
                    relatedValues: relatedValues.slice(0, 12)
                })
            })
        } else if (
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
                // reset selected values
                this.props.resetSelectedDndValues();
                // Set them to the list of related values
                this.setState({
                    loadingSimilarValue: false,
                    relatedValues: relatedValues,
                    loading: false,
                    activeTab: '3'
                })
            })
        }
        this.setState({ loadingSimilarValue: false })
    }

    addToContributionData = (statements) => {
        this.props.prefillStatements({
            statements: { properties: Object.values(statements.properties), values: Object.values(statements.values) },
            resourceId: this.props.selectedResource,
        });
        this.toggleModal();
    };

    handleChangeSearchRelated = (e) => {
        if (e.target.name === 'searchSimilarContribution') {
            this.getRelatedContributions(e.target.value);
        }
        if (e.target.name === 'searchSimilarProperty') {
            this.getRelatedProperties(e.target.value);
        }
        if (e.target.name === 'searchSimilarValue') {
            this.getRelatedValues(e.target.value);
        }
        this.setState({ [e.target.name]: e.target.value });
    };

    droppedContribution = (id) => {
        this.setState({
            relatedContributions: this.state.relatedContributions.filter(obj => obj.id !== id)
        })
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
        return (
            <div>
                <Nav tabs>
                    <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '1' })}
                            onClick={() => { this.toggle('1'); }}
                        >
                            Similar
                        </NavLink>
                    </NavItem>
                    <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '2' })}
                            onClick={() => { this.toggle('2'); }}
                        >
                            Properties
                        </NavLink>
                    </NavItem>
                    <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === '3' })}
                            onClick={() => { this.toggle('3'); }}
                        >
                            Values
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        <Row>
                            <Col sm="12">
                                <div className="d-flex mr-2 mt-2 mb-2">
                                    <div className="input-group">
                                        <Input
                                            bsSize="sm"
                                            type="text"
                                            placeholder="Paper title..."
                                            className="form-control"
                                            value={this.state.searchSimilarContribution}
                                            onChange={this.handleChangeSearchRelated}
                                            name="searchSimilarContribution"
                                        />

                                        <div className="input-group-append">
                                            <Button size="sm" className="btn btn-outline-secondary pl-2 pr-2 search-icon" type="submit">
                                                <Icon icon={faSearch} color={'#fff'} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {!this.state.loadingSimilarContribution && this.state.relatedContributions.length > 0 && (
                                    <StyledRelatedData className={'scrollbox'}>
                                        {this.state.relatedContributions.map((p) => {
                                            if (p.contributions.length > 1) {
                                                return (
                                                    <RelatedContributionCarousel
                                                        contributions={p.contributions}
                                                        openDialog={this.handleViewRelatedContributionClick}
                                                        dropped={this.droppedContribution}
                                                        key={`s${p.id}`}
                                                        authors={p.authorNames}
                                                        id={p.id}
                                                        label={p.title}
                                                    />)
                                            } else {
                                                return (
                                                    <RelatedContribution
                                                        openDialog={this.handleViewRelatedContributionClick}
                                                        dropped={this.droppedContribution}
                                                        key={`s${p.id}`}
                                                        authors={p.authorNames}
                                                        id={p.id}
                                                        label={p.title}
                                                        contribution={p.contributions[0]}
                                                    />)
                                            }
                                        })
                                        }
                                    </StyledRelatedData>
                                )}
                                {!this.state.loadingSimilarContribution && this.state.relatedContributions.length === 0 && (
                                    <div className="text-center mt-4 mb-4">
                                        No similar contribution found.<br />
                                        Please use the search field.
                                    </div>
                                )}
                                {this.state.loadingSimilarContribution && (
                                    <div className="text-center mt-4 mb-4">
                                        <span style={{ fontSize: 50 }}>
                                            <Icon icon={faSpinner} spin />
                                        </span>
                                        <br />
                                        Loading...
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="2">
                        <Row>
                            <Col sm="12">
                                <div className="d-flex mr-2 mt-2 mb-2">
                                    {this.props.dndSelectedProperties.length > 0 && (
                                        <Button onClick={() => {
                                            this.props.prefillStatements({
                                                statements: {
                                                    properties: this.props.dndSelectedProperties.map(p => { return { existingPredicateId: p.id, label: p.label } }),
                                                    values: []
                                                },
                                                resourceId: this.props.selectedResource
                                            });
                                            this.props.resetSelectedDndProperties();
                                        }
                                        }
                                            size="sm" color="primary" className="mr-2 pl-2 pr-2"
                                        >
                                            <Icon icon={faPlus} />
                                        </Button>
                                    )}
                                    <div className="input-group">
                                        <Input
                                            bsSize="sm"
                                            type="text"
                                            placeholder="Property label..."
                                            className="form-control"
                                            value={this.state.searchSimilarProperty}
                                            onChange={this.handleChangeSearchRelated}
                                            name="searchSimilarProperty"
                                        />

                                        <div className="input-group-append">
                                            <Button size="sm" className="btn btn-outline-secondary pl-2 pr-2 search-icon" type="submit">
                                                <Icon icon={faSearch} color={'#fff'} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {!this.state.loadingSimilarProperty && this.state.relatedProperties.length > 0 && (
                                    <StyledRelatedData className={'scrollbox'}>
                                        {this.state.relatedProperties.map((p) => (
                                            <RelatedProperty
                                                dropped={this.droppedProperty}
                                                key={`s${p.id}`}
                                                id={p.id}
                                                label={p.label}
                                            />))}
                                    </StyledRelatedData>
                                )}
                                {!this.state.loadingSimilarProperty && this.state.relatedProperties.length === 0 && (
                                    <div className="text-center mt-4 mb-4">
                                        No related properties found.<br />
                                        Please use the search field.
                                    </div>
                                )}
                                {this.state.loadingSimilarProperty && (
                                    <div className="text-center mt-4 mb-4">
                                        <span style={{ fontSize: 50 }}>
                                            <Icon icon={faSpinner} spin />
                                        </span>
                                        <br />
                                        Loading...
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="3">
                        <Row>
                            <Col sm="12">
                                <div className="d-flex mr-2 mt-2 mb-2">
                                    {this.props.dndSelectedValues.length > 0 && this.props.selectedProperty && (
                                        <Button onClick={() => {
                                            this.props.prefillStatements({
                                                statements: {
                                                    properties: [],
                                                    values: this.props.dndSelectedValues.map(v => { return { id: v.id, label: v.label, propertyId: this.props.selectedProperty, isExistingValue: true, type: 'object' } }),
                                                },
                                                resourceId: this.props.selectedResource
                                            });
                                            this.props.resetSelectedDndValues();
                                        }} size="sm" color="primary" className="mr-2 pl-2 pr-2"
                                        >
                                            <Icon icon={faPlus} />
                                        </Button>
                                    )}
                                    <div className="input-group">
                                        <Input
                                            bsSize="sm"
                                            type="text"
                                            placeholder="Resource label..."
                                            className="form-control"
                                            value={this.state.searchSimilarValue}
                                            onChange={this.handleChangeSearchRelated}
                                            name="searchSimilarValue"
                                        />

                                        <div className="input-group-append">
                                            <Button size="sm" className="btn pl-2 pr-2" type="submit">
                                                <Icon icon={faSearch} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {!this.state.loadingSimilarValue && this.state.relatedValues.length > 0 && this.props.selectedProperty && (
                                    <StyledRelatedData className={'scrollbox'}>
                                        {this.state.relatedValues.map((v) => (
                                            <RelatedValue
                                                dropped={this.droppedValue}
                                                key={`s${v.id}`}
                                                id={v.id}
                                                label={v.label}
                                            />))}
                                    </StyledRelatedData>
                                )}
                                {!this.state.loadingSimilarValue && (this.state.relatedValues.length === 0 || !this.props.selectedProperty) && (
                                    <div className="text-center mt-4 mb-4">
                                        No related values found.<br />
                                        Please select a property first.
                                    </div>
                                )}
                                {this.state.loadingSimilarValue && (
                                    <div className="text-center mt-4 mb-4">
                                        <span style={{ fontSize: 50 }}>
                                            <Icon icon={faSpinner} spin />
                                        </span>
                                        <br />
                                        Loading...
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>
                {
                    this.state.modal && (
                        <StatementBrowserDialog enableSelection={true} selectedAction={this.addToContributionData} show={this.state.modal} toggleModal={this.toggleModal} resourceId={this.state.dialogResourceId} resourceLabel={this.state.dialogResourceLabel} />
                    )
                }
            </div >
        )
    }
}


SimilarContributionData.propTypes = {
    id: PropTypes.string.isRequired,
    selectedResearchField: PropTypes.string.isRequired,
    contributions: PropTypes.object.isRequired,
    researchProblems: PropTypes.array.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    dndSelectedProperties: PropTypes.array.isRequired,
    dndSelectedValues: PropTypes.array.isRequired,
    resetSelectedDndProperties: PropTypes.func.isRequired,
    resetSelectedDndValues: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        selectedResearchField: state.addPaper.selectedResearchField,
        researchProblems: state.addPaper.contributions.byId[ownProps.id] ? state.addPaper.contributions.byId[ownProps.id].researchProblems : [],
        contributions: state.addPaper.contributions,
        selectedContribution: state.addPaper.selectedContribution,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        dndSelectedProperties: state.addPaper.dndSelectedProperties,
        dndSelectedValues: state.addPaper.dndSelectedValues,
    }
};

const mapDispatchToProps = dispatch => ({
    prefillStatements: (data) => dispatch(prefillStatements(data)),
    resetSelectedDndProperties: () => dispatch(resetSelectedDndProperties()),
    resetSelectedDndValues: () => dispatch(resetSelectedDndValues()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SimilarContributionData);

