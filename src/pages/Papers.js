import React, { Component } from 'react';
import { getResourcesByClass } from '../network';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaperCardDynamic from './../components/PaperCard/PaperCardDynamic';

export default class Papers extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false,
            paperCards: []
        };
    }

    componentDidMount() {
        document.title = 'Papers - ORKG';

        this.loadMorePapers();
    }

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_PAPER,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(papers => {
            if (papers.length > 0) {
                // Fetch the data for each paper
                const paperCards = papers.map(paper => {
                    return this.getPaperCard(paper);
                });
                this.setState({
                    paperCards: [...this.state.paperCards, ...paperCards],
                    isNextPageLoading: false,
                    hasNextPage: paperCards.length >= this.pageSize,
                    page: this.state.page + 1
                });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    getPaperCard = paper => {
        return <PaperCardDynamic paper={{ title: paper.label, id: paper.id }} key={`pc${paper.id}`} />;
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all papers</h1>
                </Container>
                <Container className={'p-0'}>
                    {this.state.paperCards.length > 0 && this.state.paperCards}
                    {this.state.paperCards.length === 0 && !this.state.isNextPageLoading && <div className="text-center mt-4 mb-4">No Papers</div>}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                        >
                            Load more papers
                        </div>
                    )}
                    {!this.state.hasNextPage && this.state.isLastPageReached && (
                        <div className="text-center mt-3">You have reached the last page.</div>
                    )}
                </Container>
            </>
        );
    }
}
