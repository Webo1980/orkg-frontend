import React, { Component } from 'react';
import { Carousel, CarouselItem, CarouselIndicators } from 'reactstrap';
import { getResourcesByClass, getStatementsBySubject } from '../../network';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';
import Dotdotdot from 'react-dotdotdot';

const CarouselContainer = styled.div`
    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.orkgPrimaryColor} !important;
    }
    .carousel-item {
        border-left: 5px solid ${props => props.theme.orkgPrimaryColor};
    }
`;

export default class FeaturedPapers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeIndex: 0,
            animating: false,
            loadingPapers: false,
            papers: []
        };
    }

    componentDidMount() {
        this.loadfeaturedPapers();
    }

    loadfeaturedPapers = async () => {
        this.setState({ loadingPapers: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_FEATURED_PAPER,
            page: 1,
            items: 5,
            desc: true
        }).then(paperStatements => {
            let d = paperStatements.map(async (paper, index) => {
                let paperItem = {
                    id: paper.id,
                    label: paper.label,
                    firstAuthor: null,
                    publicationYear: null
                };

                let statements = await getStatementsBySubject({ id: paper.id });
                statements = statements.filter(
                    statement =>
                        statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR ||
                        statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR
                );
                statements.reverse(); // order statements to ensure that the first author statements is ordered at the top

                for (var i = 0; i < statements.length; i++) {
                    if (statements[i].predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR) {
                        paperItem.publicationYear = statements[i].object.label;
                    }
                }
                for (var j = 0; j < statements.length; j++) {
                    if (statements[j].predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR) {
                        paperItem.firstAuthor = statements[j].object.label;
                        break; // only the first author needed
                    }
                }
                return paperItem;
            });
            Promise.all(d).then(papers => {
                this.setState({
                    papers: papers,
                    loadingPapers: false
                });
            });
        });
    };

    next = () => {
        if (this.state.animating) {
            return;
        }
        const nextIndex = this.state.activeIndex === this.state.papers.length - 1 ? 0 : this.state.activeIndex + 1;
        this.setState({ activeIndex: nextIndex });
    };

    previous = () => {
        if (this.state.animating) {
            return;
        }
        const nextIndex = this.state.activeIndex === 0 ? this.state.papers.length - 1 : this.state.activeIndex - 1;
        this.setState({ activeIndex: nextIndex });
    };

    goToIndex = newIndex => {
        this.setState({ activeIndex: newIndex });
    };

    slides = () => {
        return this.state.papers.map((item, index) => {
            return (
                <CarouselItem
                    onExiting={() => this.setState({ animating: true })}
                    onExited={() => this.setState({ animating: false })}
                    className={'pt-4 pb-1 pl-4 pr-4'}
                    key={`fp${item.id}`}
                >
                    <div style={{ minHeight: '120px' }}>
                        <h5>
                            <Link className="" to={reverse(ROUTES.VIEW_PAPER, { resourceId: item.id })}>
                                <Dotdotdot clamp={2}>{item.label}</Dotdotdot>
                            </Link>
                        </h5>
                        <div>
                            <i>{`${item.firstAuthor}, ${item.publicationYear}`}</i>
                        </div>
                    </div>
                </CarouselItem>
            );
        });
    };

    render() {
        return (
            <div className="mr-4 box" style={{ overflow: 'hidden', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <h2
                    className="h6"
                    style={{
                        marginBottom: 0,
                        color: '#FFF',
                        padding: '15px',
                        background: '#80869b'
                    }}
                >
                    Featured papers
                    <span style={{ color: '#fff', fontSize: '11px' }}> See how research papers look like as structred data</span>
                </h2>
                <CarouselContainer>
                    {!this.state.loadingPapers ? (
                        <Carousel activeIndex={this.state.activeIndex} next={this.next} previous={this.previous}>
                            {this.slides()}
                            <CarouselIndicators items={this.state.papers} activeIndex={this.state.activeIndex} onClickHandler={this.goToIndex} />
                        </Carousel>
                    ) : (
                        <div style={{ height: '130px' }} className={'pt-4 pb-1 pl-4 pr-4'}>
                            <ContentLoader speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb" ariaLabel={false}>
                                <rect x="1" y="0" rx="4" ry="4" width="300" height="20" />
                                <rect x="1" y="25" rx="3" ry="3" width="250" height="20" />
                            </ContentLoader>
                        </div>
                    )}
                </CarouselContainer>
            </div>
        );
    }
}
