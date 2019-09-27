import React, { Component } from 'react'
import { Row, Col, Button, Nav, NavItem, NavLink, TabContent, TabPane, Input } from 'reactstrap';
import RelatedProperty from './RelatedProperty';
import RelatedValue from './RelatedValue';
import RelatedContribution from './RelatedContribution';
import classnames from 'classnames';
import StatementBrowserDialog from './../../StatementBrowser/StatementBrowserDialog';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { StyledRelatedData } from './styled';
import { prefillStatements } from '../../../actions/addPaper';
import { getStatementsByPredicate, getStatementsBySubject, getStatementsByObject } from './../../../network';
import PropTypes from 'prop-types';

class SimilarContributionData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            searchRelated: '',
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
            relatedContributions: [],
            selectedProperties: [],
            selectedValues: [],
        };
    }

    componentDidMount() {
        // if there is no contribution yet, create the first one
        if (this.props.contributions.allIds.length === 0) {
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

    toggleModal = () => {
        this.setState((prevState) => ({
            modal: !prevState.modal,
        }));
    };

    toggleSelectedProperties = (property) => {
        if (this.state.selectedProperties.some(c => c.id === property.id)) {
            // unselect
            const filteredItems = this.state.selectedProperties.filter(item => {
                return item.id !== property.id
            })
            this.setState({
                selectedProperties: filteredItems,
            })
        } else {
            this.setState({
                selectedProperties: [...this.state.selectedProperties, property],
            })
        }
    };

    toggleSelectedValues = (value) => {
        if (this.state.selectedValues.some(c => c.id === value.id)) {
            // unselect
            const filteredItems = this.state.selectedValues.filter(item => {
                return item.id !== value.id
            })
            this.setState({
                selectedValues: filteredItems,
            })
        } else {
            this.setState({
                selectedValues: [...this.state.selectedValues, value],
            })
        }
    };

    handleViewRelatedContributionClick = (ressourceID, ressourceLabel) => {
        this.setState({
            modal: true,
            dialogResourceId: ressourceID,
            dialogResourceLabel: ressourceLabel,
        });
    };

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

    addToContributionData = (statements) => {
        this.props.prefillStatements({
            statements: { properties: Object.values(statements.properties), values: Object.values(statements.values) },
            resourceId: this.props.selectedResource,
        });
        this.toggleModal();
    };

    handleChangeSearchRelated = (e) => {
        this.setState({
            searchRelated: e.target.value,
        })
    };

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
                                        <Input bsSize="sm" type="text" className="form-control" value={this.state.searchRelated}
                                            onChange={this.handleChangeSearchRelated} />

                                        <div className="input-group-append">
                                            <Button size="sm" className="btn btn-outline-secondary pl-2 pr-2 search-icon" type="submit">
                                                <Icon icon={faSearch} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <StyledRelatedData className={'scrollbox'}>
                                    {this.state.relatedContributions.map((p) => (
                                        <RelatedContribution
                                            openDialog={this.handleViewRelatedContributionClick}
                                            dropped={this.droppedProperty}
                                            key={`s${p.id}`}
                                            authors={p.authorNames} id={p.id}
                                            label={p.title}
                                            contributions={p.contributions}
                                        />))}
                                </StyledRelatedData>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="2">
                        <Row>
                            <Col sm="12">
                                <div className="d-flex mr-2 mt-2 mb-2">
                                    {this.state.selectedProperties.length > 0 && (
                                        <Button onClick={null} size="sm" color="primary" className="mr-2 pl-2 pr-2">
                                            <Icon icon={faPlus} />
                                        </Button>
                                    )}
                                    <div className="input-group">
                                        <Input bsSize="sm" type="text" className="form-control" value={this.state.searchRelated}
                                            onChange={this.handleChangeSearchRelated} />

                                        <div className="input-group-append">
                                            <Button size="sm" className="btn btn-outline-secondary pl-2 pr-2 search-icon" type="submit">
                                                <Icon icon={faSearch} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <StyledRelatedData className={'scrollbox'}>
                                    {this.state.relatedProperties.map((p) => (
                                        <RelatedProperty
                                            selected={this.state.selectedProperties.some(c => c.id === p.id)}
                                            toggleSelect={this.toggleSelectedProperties}
                                            dropped={this.droppedProperty}
                                            key={`s${p.id}`}
                                            id={p.id}
                                            label={p.label}
                                        />))}
                                </StyledRelatedData>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="3">
                        <Row>
                            <Col sm="12">
                                <div className="d-flex mr-2 mt-2 mb-2">
                                    {this.state.selectedValues.length > 0 && (
                                        <Button onClick={null} size="sm" color="primary" className="mr-2 pl-2 pr-2">
                                            <Icon icon={faPlus} />
                                        </Button>
                                    )}
                                    <div className="input-group">
                                        <Input bsSize="sm" type="text" className="form-control" value={this.state.searchRelated}
                                            onChange={this.handleChangeSearchRelated} />

                                        <div className="input-group-append">
                                            <Button size="sm" className="btn btn-outline-secondary pl-2 pr-2 search-icon" type="submit">
                                                <Icon icon={faSearch} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <StyledRelatedData className={'scrollbox'}>
                                    {this.state.relatedValues.map((v) => (
                                        <RelatedValue
                                            selected={this.state.selectedValues.some(c => c.id === v.id)}
                                            toggleSelect={this.toggleSelectedValues}
                                            dropped={this.droppedValue}
                                            key={`s${v.id}`}
                                            id={v.id}
                                            label={v.label}
                                        />))}
                                </StyledRelatedData>
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>
                {this.state.modal && (
                    <StatementBrowserDialog enableSelection={true} selectedAction={this.addToContributionData} show={this.state.modal} toggleModal={this.toggleModal} resourceId={this.state.dialogResourceId} resourceLabel={this.state.dialogResourceLabel} />
                )}
            </div>
        )
    }
}


SimilarContributionData.propTypes = {
    selectedResearchField: PropTypes.string.isRequired,
    contributions: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    prefillStatements: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
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
    prefillStatements: (data) => dispatch(prefillStatements(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SimilarContributionData);

