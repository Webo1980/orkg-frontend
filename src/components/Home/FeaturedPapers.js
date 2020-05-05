import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { getResourcesByClass, getStatementsBySubjects } from '../../network';
import { getPaperData, sortMethod } from 'utils';
import { find } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';

class FeaturedPapers extends Component {
    state = {
        papers: null
    };

    componentDidMount() {
        this.loadfeaturedPapers();
    }

    loadfeaturedPapers = async () => {
        this.setState({ loadingPapers: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_FEATURED_PAPER,
            page: 1,
            items: 7,
            desc: true
        }).then(result => {
            getStatementsBySubjects({ ids: result.map(p => p.id) })
                .then(papersStatements => {
                    let papers = papersStatements.map(paperStatements => {
                        const paperSubject = find(result, { id: paperStatements.id });
                        return getPaperData(
                            paperStatements.id,
                            paperSubject && paperSubject.label ? paperSubject.label : 'No Title',
                            paperStatements.statements
                        );
                    });

                    // order featured comparison
                    papers = papers.sort((p1, p2) => sortMethod(p1.order, p2.order));

                    this.setState({
                        papers: papers
                    });
                })
                .catch(error => {
                    this.setState({
                        papers: null
                    });
                    console.log(error);
                });
        });
    };

    render() {
        return (
            <div className="pl-3 pr-3 p-4">
                {this.state.papers ? (
                    this.state.papers.length > 0 ? (
                        <>
                            <ListGroup>
                                {this.state.papers.map((paper, index) => (
                                    <ListGroupItem key={index} className="p-0 m-0 mb-4" style={{ border: 0 }}>
                                        <h5 className="h6">
                                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id })} style={{ color: 'inherit' }}>
                                                {paper.label ? paper.label : <em>No title</em>}
                                            </Link>
                                        </h5>
                                        {paper.authorNames && paper.authorNames.length > 0 && (
                                            <span className="badge badge-lightblue"> {paper.authorNames[0].label}</span>
                                        )}

                                        {/*<span className="badge badge-lightblue"> {paper.paperItem.researchField}</span> // reserach fields can be long which doesn't look like in a badge here*/}
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </>
                    ) : (
                        <div className="text-center">No papers found</div>
                    )
                ) : (
                    <div className="text-center">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </div>
        );
    }
}

export default FeaturedPapers;
