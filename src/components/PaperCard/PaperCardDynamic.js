import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import { compose } from 'redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from '../../constants/routes.js';
import AddToComparison from './../ViewPaper/AddToComparison';
import PropTypes from 'prop-types';
import moment from 'moment';
import ContentLoader from 'react-content-loader';
import { getStatementsBySubject } from '../../network';
import { getPaperDataForViewAllPapers } from '../../utils';

const PaperCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

class PaperCardDynamic extends Component {
    constructor(props) {
        super();
        this.state = { isLoading: true, paperStatements: [] };
    }

    componentDidMount() {
        getStatementsBySubject({ id: this.props.paper.id }).then(paperStatements => {
            const optimizedPaperObject = getPaperDataForViewAllPapers(paperStatements);
            this.setState({ optimizedPaperObject: optimizedPaperObject, isLoading: false });
        });
    }

    render() {
        return (
            <PaperCardStyled
                className={
                    'list-group-item list-group-item-action ' +
                    (this.props.contribution && this.props.comparison.allIds.includes(this.props.contribution.id) ? 'selected' : '')
                }
            >
                <Row>
                    <Col sm={this.props.contribution ? 9 : 12}>
                        {this.props.contribution && (
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paper.id, contributionId: this.props.contribution.id })}>
                                {this.props.paper.title ? this.props.paper.title : <em>No title</em>}
                            </Link>
                        )}
                        {!this.props.contribution && (
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paper.id })}>
                                {this.props.paper.title ? this.props.paper.title : <em>No title</em>}
                            </Link>
                        )}
                        <br />
                        {!this.state.isLoading && (
                            <small>
                                {this.state.optimizedPaperObject.authorNames && this.state.optimizedPaperObject.authorNames.length > 0 && (
                                    <>
                                        <Icon size={'sm'} icon={faUser} /> {this.state.optimizedPaperObject.authorNames.map(a => a.label).join(', ')}
                                    </>
                                )}
                                {(this.state.optimizedPaperObject.publicationMonth || this.state.optimizedPaperObject.publicationYear) && (
                                    <Icon size={'sm'} icon={faCalendar} className="ml-2 mr-1" />
                                )}
                                {this.state.optimizedPaperObject.publicationMonth &&
                                    this.state.optimizedPaperObject.length > 0 &&
                                    moment(this.state.optimizedPaperObject.publicationMonth, 'M').format('MMMM') + ' '}
                                {this.state.optimizedPaperObject.publicationYear}
                            </small>
                        )}
                        {/*Show Loading Dynamic data indicator if we are loading */}
                        {this.state.isLoading && (
                            <ContentLoader height={12} speed={2} primaryColor="#f3f3f3" secondaryColor="#ccc">
                                <rect x="0" y="5" width="100%" height="5" rx="2" ry="2" />
                            </ContentLoader>
                        )}
                    </Col>
                    {this.props.contribution && (
                        <Col sm="3">
                            <div className="options">
                                <AddToComparison
                                    contributionId={this.props.contribution.id}
                                    paperId={this.props.paper.id}
                                    paperTitle={this.props.paper.title}
                                    contributionTitle={this.props.contribution.title}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
            </PaperCardStyled>
        );
    }
}

PaperCardDynamic.propTypes = {
    paper: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        authorNames: PropTypes.array,
        publicationMonth: PropTypes.string,
        publicationYear: PropTypes.string
    }).isRequired,
    contribution: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string
    }),
    comparison: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison
});

export default compose(
    connect(mapStateToProps),
    withCookies
)(PaperCardDynamic);
