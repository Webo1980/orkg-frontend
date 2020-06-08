import React, { Component } from 'react';
import { getResourcesByClass, getStatementsBySubjects } from '../network';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaperCardDynamic from './../components/PaperCard/PaperCardDynamic';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { appendAtEnd, appendAtFront, addLoadedPapers } from '../actions/action_viewAllPapers';
import { differenceBy } from 'lodash';

/** SOME CONSTANTS FOR LOADING MODES**/
const MODE_LOAD_ALL = 'MODE_LOAD_ALL';
const MODE_APPEND_FRONT = ' MODE_APPEND_FRONT';
const MODE_APPEND_BACK = 'MODE_APPEND_BACK';

class Papers extends Component {
    constructor(props) {
        super(props);

        /** page related variables **/
        this.pageSize = 25;
        this.currentPageNumber = 1;
        this.pageIncrement = 1;

        this.componentISMounted = false;
        this.hasDifferenceInPapers = false;

        this.state = {
            statements: [],
            isNextPageLoading: false,
            hasNextPage: false,
            isLastPageReached: false,
            paperCards: [],
            callUpdateInPaperCard: false,
            preventLoopUpdate: true
        };
    }

    componentDidMount() {
        // verify that the loaded papers and the loaded statements are consistent!
        this.componentISMounted = true; // used to prevent event loops to try to call state updates when not mounted,
        // used in fetchDataForPapers()
        const notLoadedPapers = differenceBy(this.props.loadedPapers, this.props.loadedStatements, 'id');
        if (notLoadedPapers.length > 0) {
            this.hasDifferenceInPapers = true;
        }
        document.title = 'Papers - ORKG';
        this.loadMorePapers(true);
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        if (this.hasDifferenceInPapers) {
            const notLoadedPapers = differenceBy(this.props.loadedPapers, this.props.loadedStatements, 'id');
            const hasResolved = notLoadedPapers.length === 0;
            // using this to sync the user requested data and the loaded statements of each paper
            // use case is the following: when loading the user has the option to click on a paper -> thus the page changes
            // however when the event is finished it will push new data to the redux store.
            // the store might be not in sync with loaded papers and statements
            if (hasResolved) {
                // when resolved (basically by checking for an event from fetch statements ), then re-render the cards
                this.hasDifferenceInPapers = false;
                this.setState({ callUpdateInPaperCard: true });
            }
        }

        if (this.state.callUpdateInPaperCard) {
            const paperCards = this.props.loadedPapers.map((paper, index) => {
                return this.getPaperCard(paper, this.props.loadedStatements[index]);
            });
            this.setState({ paperCards: [...paperCards], callUpdateInPaperCard: false, preventLoopUpdate: false });
        } else {
            // Throw the rendered stuff directly here
            if (!this.state.preventLoopUpdate) {
                const paperCards = this.props.loadedPapers.map((paper, index) => {
                    const paperCardData = this.props.loadedStatements.find(({ id }) => id === paper.id);
                    return this.getPaperCard(paper, paperCardData);
                });
                this.setState({ paperCards: [...paperCards], callUpdateInPaperCard: false, preventLoopUpdate: true });
            }
        }
    }
    componentWillUnmount(): void {
        this.componentISMounted = false;
    }

    loadMorePapers = initLoad => {
        this.setState({ isNextPageLoading: true });
        let userRequestedMoreData = false;
        if (initLoad === true) {
            /** init load tries to check if new data has been added while being on another page **/
            this.currentPageNumber = 1;
            this.pageIncrement = 1;
        } else {
            userRequestedMoreData = true; // << requesting data using load more papers button
            const newPageNumber = parseInt(this.props.loadedStatements.length / this.pageSize);
            this.currentPageNumber = newPageNumber + this.pageIncrement;
        }

        // request the papers resources
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_PAPER,
            page: this.currentPageNumber,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(papers => {
            const existingPaperStatements = this.props.loadedPapers;
            let newPapers = [];
            if (existingPaperStatements.length === 0) {
                this.__loadFromScratchNewData(papers);
            } else {
                // check for difference in the papers with existing ones, and load only the ones that are new!
                newPapers = differenceBy(papers, existingPaperStatements, 'id');
                const hasNextPage = papers.length >= this.pageSize;
                if (newPapers.length === 0 && !userRequestedMoreData) {
                    this.__renderWithUpdateInCards();
                }
                if (newPapers.length === 0 && userRequestedMoreData) {
                    // no new data has been found for current page due to update in backend
                    // >>  increase page number and try again!;
                    // we use the page increment variable:
                    // page is computed based on currently loaded items length plus page increment
                    this.pageIncrement++;
                    // will be set to 1 again in __loadAdditionalData()
                    this.loadMorePapers();
                } else if (!userRequestedMoreData) {
                    this.__loadUpdatedData(newPapers, hasNextPage);
                } else if (userRequestedMoreData) {
                    this.__loadAdditionalData(newPapers, hasNextPage);
                }
            }
        });
    };

    fetchDataForPapers = (papers, mode) => {
        if (papers.length === 0) {
            return;
        }

        getStatementsBySubjects({ ids: papers.map(p => p.id) })
            .then(statements => {
                switch (mode) {
                    case MODE_LOAD_ALL:
                        this.props.appendAtEnd(statements);
                        if (this.componentISMounted) {
                            this.setState({ callUpdateInPaperCard: true });
                        }
                        break;
                    case MODE_APPEND_FRONT:
                        this.props.appendAtFront(statements);
                        if (this.componentISMounted) {
                            this.setState({ callUpdateInPaperCard: true });
                        }
                        break;
                    case MODE_APPEND_BACK:
                        this.props.appendAtEnd(statements);
                        if (this.componentISMounted) {
                            this.setState({ callUpdateInPaperCard: true });
                        }
                        break;
                    default:
                        console.log(
                            'MODE NOT SET' + mode + ' SHOULD BE [' + MODE_LOAD_ALL + ', ' + MODE_APPEND_FRONT + ', or' + MODE_APPEND_BACK + ']'
                        );
                }
            })
            .catch(error => {
                if (this.componentISMounted) {
                    this.setState({
                        isNextPageLoading: false,
                        hasNextPage: false,
                        isLastPageReached: true
                    });
                }
                console.log(error);
            });
    };

    /** Helper Functions **/
    __loadFromScratchNewData = papers => {
        this.props.addLoadedPapers(papers);
        this.setState({
            preventLoopUpdate: false,
            isNextPageLoading: false,
            hasNextPage: papers.length >= this.pageSize
        });
        this.fetchDataForPapers(papers, MODE_LOAD_ALL);
    };

    __loadAdditionalData = (newPapers, hasNextPage) => {
        // this function is used to add (append at the end ) new data to the list
        this.pageIncrement = 1; // << we set page increment to 1 if new data has been loaded
        this.props.addLoadedPapers([...this.props.loadedPapers, ...newPapers]);
        this.setState({
            preventLoopUpdate: false,
            isNextPageLoading: false,
            hasNextPage: hasNextPage
        });
        this.fetchDataForPapers(newPapers, MODE_APPEND_BACK);
    };

    __loadUpdatedData = (newPapers, hasNextPage) => {
        // this function is used when in the backend something has changed and we want to fetch new data and append it in the front
        this.props.addLoadedPapers([...newPapers, ...this.props.loadedPapers]);
        this.setState({
            preventLoopUpdate: false,
            isNextPageLoading: false,
            hasNextPage: hasNextPage
        });
        this.fetchDataForPapers(newPapers, MODE_APPEND_FRONT);
    };

    __renderWithUpdateInCards = () => {
        // this is used to emit an update event and force the paper cards to update
        // after the bulk update the cards receive data for rendering but also need to be re-rendered
        this.setState({
            callUpdateInPaperCard: true,
            isNextPageLoading: false,
            hasNextPage: true
        });
    };

    getPaperCard = (paper, paperData) => {
        return <PaperCardDynamic paper={{ title: paper.label, id: paper.id, paperData: paperData }} key={`pc${paper.id}`} />;
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

Papers.propTypes = {
    appendAtEnd: PropTypes.func,
    appendAtFront: PropTypes.func,
    addLoadedPapers: PropTypes.func,
    loadedStatements: PropTypes.array,
    loadedPapers: PropTypes.array
};

const mapStateToProps = state => {
    return {
        loadedStatements: state.allPapers.loadedStatements,
        loadedPapers: state.allPapers.loadedPapers
    };
};

const mapDispatchToProps = dispatch => ({
    appendAtEnd: payload => dispatch(appendAtEnd(payload)),
    appendAtFront: payload => dispatch(appendAtFront(payload)),
    addLoadedPapers: payload => dispatch(addLoadedPapers(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Papers);
