import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getStatementsBySubject, getStatementsByObject } from '../../network';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';

/* Bootstrap card column is not working correctly working with vertical alignment,
thus used custom styling here */

const Card = styled.div`
    cursor: pointer;
    background: #E86161!important;
    color: #fff!important;
    border: 0!important;
    border-radius:12px!important;
    min-height: 75px;
    flex: 0 0 calc(33% - 20px)!important;
    margin:10px;
    transition:opacity 0.2s;

    &:hover {
        opacity: 0.8
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
`;

const BreadcrumbLink = styled.span`
    cursor:pointer;
    margin-right:5px;

    &:hover {
        text-decoration:underline;
    }
`;

class ResearchFieldCards extends Component {
    state = {
        researchFields: [],
        breadcrumb: [],
        papers: null,
        error: '',
        isFieldsLoading: false
    }

    componentDidMount() {
        this.getFields(process.env.REACT_APP_RESEARCH_FIELD_MAIN, 'Main');
    }

    async getFields(fieldId, label, addBreadcrumb = true) {
        this.setState({ isFieldsLoading: true })
        try {
            await getStatementsBySubject({ id: fieldId }).then(async (res) => {
                Promise.all(res.map((elm) => {
                    return getStatementsBySubject({ id: elm.object.id }).then(subResearchFields => {
                        if (subResearchFields.length === 0) {
                            return getStatementsByObject({
                                id: elm.object.id,
                                page: 1,
                                items: 999,
                                sortBy: 'id',
                                desc: true
                            }).then(papers =>
                                ({
                                    'label': elm.object.label,
                                    'id': elm.object.id,
                                    'papers': papers.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD).length,
                                    'subfields': 0
                                }));
                        } else {
                            return {
                                'label': elm.object.label,
                                'id': elm.object.id,
                                'papers': 0,
                                'subfields': subResearchFields.length,
                            };
                        }
                    })
                })).then(researchFields => {
                    // sort research fields alphabetically
                    researchFields = researchFields.sort((a, b) => {
                        return a.label.localeCompare(b.label);
                    });
                    this.setState({
                        researchFields: researchFields,
                        error: '',
                        isFieldsLoading: false
                    });
                })

                if (addBreadcrumb) {
                    let breadcrumb = this.state.breadcrumb;

                    breadcrumb.push({
                        'label': label,
                        'id': fieldId,
                    });

                    this.setState({
                        breadcrumb: breadcrumb
                    });
                }

                if (fieldId !== process.env.REACT_APP_RESEARCH_FIELD_MAIN) {
                    this.setState({
                        papers: null, // to show loading indicator
                    });

                    let papers = await getStatementsByObject({
                        id: fieldId,
                        page: 1,
                        items: 24,
                        sortBy: 'id',
                        desc: true
                    });

                    papers = papers.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);

                    this.setState({
                        papers,
                    });
                }
            }).catch((e) => {
                this.setState({
                    error: e.message,
                    isFieldsLoading: false
                });
            });
        } catch (e) {
            this.setState({
                error: e.message,
                isFieldsLoading: false
            });
        }
    }

    handleClickBreadcrumb(fieldId, label) {
        let activeIndex = this.state.breadcrumb.findIndex(breadcrumb => breadcrumb.id === fieldId);
        let breadcrumb = this.state.breadcrumb.slice(0, activeIndex + 1); //remove the items after the clicked link

        this.setState({
            breadcrumb
        });

        this.getFields(fieldId, label, false);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="text-center mt-5 text-danger">{this.state.error}</div>
            );
        }

        let showPapers = !this.state.isFieldsLoading && this.state.researchFields.length === 0 && this.state.breadcrumb.length !== 0;

        return (
            <div className="mt-5">
                {this.state.breadcrumb.map((field, index) => (
                    <BreadcrumbLink
                        key={field.id}
                        onClick={() => this.handleClickBreadcrumb(field.id, field.label)}
                    >
                        {field.label} {' '}
                        {index !== this.state.breadcrumb.length - 1 && <Icon icon={faAngleDoubleRight} />}
                    </BreadcrumbLink>
                ))}

                <hr className="mt-3 mb-5" />
                {!this.state.isFieldsLoading ? (
                    <div id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap">
                        {this.state.researchFields.map((field) => (
                            <Card className="card card-body justify-content-center p-3" role="button" key={field.id} onClick={() => this.getFields(field.id, field.label)}>
                                <CardTitle className="card-title m-0">{field.label}</CardTitle>
                                <div style={{ color: '#e9ebf2', fontSize: 'small' }}>
                                    {field.subfields !== 0 ? `${field.subfields} ${field.subfields === 1 ? 'subfield' : 'subfields'}` : ''}
                                    {field.subfields === 0 && (field.papers > 0 ? `${field.papers} ${field.papers === 1 ? 'paper' : 'papers'}` : '')}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                        <div className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )
                }
                {
                    showPapers && (
                        <div className="mt-2">
                            <h2 className="h5">{this.state.breadcrumb[this.state.breadcrumb.length - 1].label} papers</h2>

                            {!this.state.papers && <div className="mt-5 text-center"><Icon icon={faSpinner} spin /> Loading</div>}

                            {this.state.papers && this.state.papers.length === 0 ? <div className="mt-5 text-center">No papers found</div> : null}

                            {this.state.papers && (
                                <ul className="mt-3">
                                    {this.state.papers.map((paper, index) => {
                                        return (
                                            <li key={index}>
                                                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.subject.id })}>
                                                    {paper.subject.label ? paper.subject.label : <em>No title</em>}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    )
                }
            </div >
        );
    }
}

export default ResearchFieldCards;