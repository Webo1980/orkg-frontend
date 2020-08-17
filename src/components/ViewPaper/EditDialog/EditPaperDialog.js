import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ListGroup } from 'reactstrap';
import {
    updateResource,
    updateLiteral,
    createLiteral as createLiteralAPI,
    createLiteralStatement,
    submitGetRequest,
    literalsUrl,
    getStatementsByObject,
    createResourceStatement,
    createResource,
    deleteStatementsByIds,
    deleteStatementById,
    updateStatement,
    getStatementsBySubjectAndPredicate,
    getStatementsBySubject,
    getStatementsBySubjects
} from 'network';
import { connect } from 'react-redux';
import EditItem from './EditItem';
import { loadPaper } from 'actions/viewPaper';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LoadingOverlay from 'react-loading-overlay';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { isEqual } from 'lodash';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { PREDICATES } from 'constants/graphSettings';
import { CLASSES } from 'constants/graphSettings';
import { updateMetaInformationAuthors, updateMetaInformationStore } from 'actions/statementBrowserStoreActions';

const LoadingOverlayStyled = styled(LoadingOverlay)`
    //border-radius: 7px;
    //overflow: hidden;
`;
class EditPaperDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            noChanges: true,
            showDialog: false,
            openItem: 'title',
            isLoading: false,
            ...this.getStateFromRedux()
        };
    }

    getStateFromRedux = () => {
        return {
            title: this.props.viewPaper.title,
            publicationMonth: this.props.viewPaper.publicationMonth,
            publicationYear: this.props.viewPaper.publicationYear,
            doi: this.props.viewPaper.doi,
            authors: this.props.viewPaper.authors,
            publishedIn: this.props.viewPaper.publishedIn,
            url: this.props.viewPaper.url,
            researchField: this.props.viewPaper.researchField
        };
    };

    toggleDialog = () => {
        if (!this.state.showDialog) {
            this.setState({
                showDialog: true,
                openItem: 'title',
                ...this.getStateFromRedux()
            });
        } else {
            this.setState({
                showDialog: false
            });
        }
    };

    handleChange = (event, name) => {
        // fixing publication month and year as int number edit;
        if (name === 'publicationMonth' || name === 'publicationYear') {
            this.setState({ [name]: parseInt(event.target.value), noChanges: false });
        } else {
            this.setState({ [name]: event.target.value, noChanges: false });
        }
    };

    handleSave = async () => {
        this.setState({
            isLoading: true
        });
        const loadPaper = {};

        const reduxState = this.getStateFromRedux();

        // add the validation if we need to update the title
        if (this.state.title !== reduxState.title) {
            await updateResource(this.props.viewPaper.paperResourceId, this.state.title);
        }

        //authors
        if (reduxState.authors !== this.state.authors) {
            await this.updateAuthors(this.state.authors); //use await to prevent updating the props, which are needed to check whether authors exist
        }

        //venue
        if (this.state.publishedIn && this.state.publishedIn.statementId && this.state.publishedIn.id) {
            if (reduxState.publishedIn !== this.state.publishedIn) {
                await updateStatement(this.state.publishedIn.statementId, { object_id: this.state.publishedIn.id });
            }
        } else if (this.state.publishedIn && !this.state.publishedIn.statementId) {
            await createResourceStatement(this.props.viewPaper.paperResourceId, PREDICATES.HAS_VENUE, this.state.publishedIn.id);
        } else if (this.state.publishedIn && this.state.publishedIn.statementId && !this.state.publishedIn.id) {
            await deleteStatementById(this.state.publishedIn.statementId);
            this.setState({ publishedIn: '' });
        }

        // research field
        if (this.state.researchField && this.state.researchField.statementId && this.state.researchField.id) {
            // console.log('RESEARCH FIELD');
            // console.log(reduxState.researchField, ' vs ', this.state.researchField);
            // console.log('are equal', reduxState.researchField === reduxState.researchField);
            // TODO : VALIDATE!!!!
            if (reduxState.researchField !== this.state.researchField) {
                await updateStatement(this.state.researchField.statementId, { object_id: this.state.researchField.id });
            }
        }

        if (reduxState.publicationMonth !== this.state.publicationMonth) {
            //publication month
            loadPaper['publicationMonthResourceId'] = await this.updateOrCreateLiteral({
                reducerName: 'publicationMonthResourceId',
                value: this.state.publicationMonth,
                predicateIdForCreate: PREDICATES.HAS_PUBLICATION_MONTH
            });
        }

        if (reduxState.publicationYear !== this.state.publicationYear) {
            //publication year
            loadPaper['publicationYearResourceId'] = await this.updateOrCreateLiteral({
                reducerName: 'publicationYearResourceId',
                value: this.state.publicationYear,
                predicateIdForCreate: PREDICATES.HAS_PUBLICATION_YEAR
            });
        }

        if (reduxState.doi !== this.state.doi) {
            // TODO VALIDATE
            //doi
            loadPaper['doiResourceId'] = await this.updateOrCreateLiteral({
                reducerName: 'doiResourceId',
                value: this.state.doi,
                predicateIdForCreate: PREDICATES.HAS_DOI
            });
        }
        if (reduxState.url !== this.state.url) {
            // TODO : VALIDATE
            //url
            loadPaper['urlResourceId'] = await this.updateOrCreateLiteral({
                reducerName: 'urlResourceId',
                value: this.state.url,
                predicateIdForCreate: PREDICATES.URL
            });
        }

        //update redux state with changes, so it is updated on the view paper page
        this.props.loadPaper({
            ...loadPaper,
            title: this.state.title,
            publicationMonth: this.state.publicationMonth,
            publicationYear: this.state.publicationYear,
            doi: this.state.doi,
            authors: this.state.authors,
            publishedIn: this.state.publishedIn,
            url: this.state.url,
            researchField: this.state.researchField
        });

        // if we have any change we update the statementBrowserStore

        if (!this.state.noChanges) {
            console.log('THIS IS WHERE WE NOW NEED TO UPDATE ONLY THE META INFORMATION STORES');
            const newPaperStatements = await getStatementsBySubject({ id: this.props.viewPaper.paperResourceId });
            this.props.updateMetaInformationStore(newPaperStatements);
        }
        if (reduxState.authors !== this.state.authors) {
            console.log('THIS IS WHERE WE NOW NEED TO UPDATE THE META INFORMATION AUTHORS (ORCIDS AND SO )');
            let authors = [];
            if (this.props.viewPaper.authors.length > 0) {
                authors = this.props.viewPaper.authors
                    .filter(author => author.classes && author.classes.includes(CLASSES.AUTHOR))
                    .map(author => {
                        return author.id;
                    });
                console.log(authors);
                // author orchid statments;
                const authroStatements = await getStatementsBySubjects({ ids: authors });
                const singleStatementsArray = [];
                authroStatements.forEach(res => {
                    singleStatementsArray.push(...res.statements);
                });

                console.log(singleStatementsArray);
                this.props.updateMetaInformationAuthors(singleStatementsArray);
            }
            // also update the meta information store
            const newPaperStatements = await getStatementsBySubject({ id: this.props.viewPaper.paperResourceId });
            this.props.updateMetaInformationStore(newPaperStatements);
        }

        this.setState({
            isLoading: false
        });

        this.toggleDialog();
    };

    updateOrCreateLiteral = async ({ reducerName, value, predicateIdForCreate }) => {
        const literalId = this.props.viewPaper[reducerName];

        if (literalId && value !== '') {
            updateLiteral(literalId, value);
            return literalId;
        } else if (literalId && value === '') {
            // delete statements because it's not possible to set empty label for literal
            await getStatementsBySubjectAndPredicate({ subjectId: this.props.viewPaper.paperResourceId, predicateId: predicateIdForCreate }).then(
                statements => {
                    deleteStatementsByIds(statements.map(s => s.id));
                }
            );
            return null;
        } else if (value) {
            // only create a new literal if a value has been provided
            const newLiteral = await this.createNewLiteral(this.props.viewPaper.paperResourceId, predicateIdForCreate, value);
            return newLiteral.literalId;
        }
        return null;
    };

    createNewLiteral = async (resourceId, predicateId, label) => {
        const newLiteral = await createLiteralAPI(label);
        const statement = await createLiteralStatement(resourceId, predicateId, newLiteral.id);

        return {
            literalId: newLiteral.id,
            statementId: statement.id
        };
    };

    // TODO: improve code by using reduce function
    updateAuthors = async () => {
        // Check if there is changes on the authors
        if (isEqual(this.props.viewPaper.authors, this.state.authors)) {
            return null;
        }

        const statementsIds = [];
        // remove all authors statement from reducer
        for (const author of this.props.viewPaper.authors) {
            statementsIds.push(author.statementId);
        }
        deleteStatementsByIds(statementsIds);

        // Add all authors from the state
        const authors = this.state.authors;
        for (const [i, author] of this.state.authors.entries()) {
            // create the author
            if (author.orcid) {
                // Create author with ORCID
                // check if there's an author resource
                const responseJson = await submitGetRequest(literalsUrl + '?q=' + encodeURIComponent(author.orcid) + '&exact=true');
                if (responseJson.length > 0) {
                    // Author resource exists
                    let authorResource = await getStatementsByObject({ id: responseJson[0].id });
                    authorResource = authorResource.find(s => s.predicate.id === PREDICATES.HAS_ORCID);
                    const authorStatement = await createResourceStatement(
                        this.props.viewPaper.paperResourceId,
                        PREDICATES.HAS_AUTHOR,
                        authorResource.subject.id
                    );
                    authors[i].statementId = authorStatement.id;
                    authors[i].id = authorResource.subject.id;
                    authors[i].class = authorResource.subject._class;
                    authors[i].classes = authorResource.subject.classes;
                } else {
                    // Author resource doesn't exist
                    // Create resource author
                    const authorResource = await createResource(author.label, [CLASSES.AUTHOR]);
                    const createLiteral = await createLiteralAPI(author.orcid);
                    await createLiteralStatement(authorResource.id, PREDICATES.HAS_ORCID, createLiteral.id);
                    const authorStatement = await createResourceStatement(
                        this.props.viewPaper.paperResourceId,
                        PREDICATES.HAS_AUTHOR,
                        authorResource.id
                    );
                    authors[i].statementId = authorStatement.id;
                    authors[i].id = authorResource.id;
                    authors[i].class = authorResource._class;
                    authors[i].classes = authorResource.classes;
                }
            } else {
                // Author resource doesn't exist
                const newLiteral = await createLiteralAPI(author.label);
                // Create literal of author
                const authorStatement = await createLiteralStatement(this.props.viewPaper.paperResourceId, PREDICATES.HAS_AUTHOR, newLiteral.id);
                authors[i].statementId = authorStatement.id;
                authors[i].id = newLiteral.id;
                authors[i].class = authorStatement.object._class;
                authors[i].classes = authorStatement.object.classes;
            }
        }

        this.setState({
            authors
        });
    };

    toggleItem = type => {
        this.setState(prevState => ({
            openItem: prevState.openItem !== type ? type : null
        }));
    };

    handleAuthorsChange = tags => {
        tags = tags ? tags : [];
        this.setState({
            authors: tags
        });
    };

    handleVenueChange = async (selected, action) => {
        if (action.action === 'select-option') {
            selected.statementId = this.state.publishedIn && this.state.publishedIn.statementId ? this.state.publishedIn.statementId : '';
            this.setState({
                publishedIn: selected,
                noChanges: false
            });
        } else if (action.action === 'create-option') {
            const newVenue = await createResource(selected.label, [CLASSES.VENUE]);
            selected.id = newVenue.id;
            selected.statementId = this.state.publishedIn && this.state.publishedIn.statementId ? this.state.publishedIn.statementId : '';
            this.setState({
                publishedIn: selected,
                noChanges: false
            });
        } else if (action.action === 'clear') {
            const statementId = this.state.publishedIn && this.state.publishedIn.statementId ? this.state.publishedIn.statementId : '';
            this.setState({
                publishedIn: { statementId: statementId, id: null, label: null },
                noChanges: false
            });
        }
    };

    handleResearchFieldChange = async (selected, action) => {
        if (action.action === 'select-option') {
            selected.statementId = this.state.researchField && this.state.researchField.statementId ? this.state.researchField.statementId : '';
            this.setState({
                researchField: selected,
                noChanges: false
            });
        }
    };

    render() {
        return (
            <>
                <div className="flex-grow-1">
                    <Button color="darkblue" size="sm" className="mt-2" style={{ marginLeft: 'auto' }} onClick={this.toggleDialog}>
                        <Icon icon={faPen} /> Edit data
                    </Button>
                </div>

                <Modal isOpen={this.state.showDialog} toggle={this.toggleDialog} size="lg">
                    <LoadingOverlayStyled
                        active={this.state.isLoading}
                        spinner
                        text="Saving..."
                        styles={{
                            overlay: base => ({
                                ...base,
                                borderRadius: 7,
                                overflow: 'hidden',
                                background: 'rgba(215, 215, 215, 0.7)',
                                color: '#282828',
                                '& svg circle': {
                                    stroke: '#282828'
                                }
                            })
                        }}
                    >
                        <ModalHeader toggle={this.toggleDialog}>Edit general data</ModalHeader>
                        <ModalBody>
                            <ListGroup className="listGroupEnlarge">
                                <EditItem
                                    open={this.state.openItem === 'title'}
                                    label="Title"
                                    type="text"
                                    value={this.state.title}
                                    onChange={e => this.handleChange(e, 'title')}
                                    toggleItem={() => this.toggleItem('title')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'month'}
                                    label="Publication month"
                                    type="month"
                                    value={this.state.publicationMonth}
                                    onChange={e => this.handleChange(e, 'publicationMonth')}
                                    toggleItem={() => this.toggleItem('month')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'year'}
                                    label="Publication year"
                                    type="year"
                                    value={this.state.publicationYear}
                                    onChange={e => this.handleChange(e, 'publicationYear')}
                                    toggleItem={() => this.toggleItem('year')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'authors'}
                                    label="Authors"
                                    type="authors"
                                    value={this.state.authors}
                                    onChange={this.handleAuthorsChange}
                                    toggleItem={() => this.toggleItem('authors')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'doi'}
                                    label="DOI"
                                    type="text"
                                    value={this.state.doi}
                                    onChange={e => this.handleChange(e, 'doi')}
                                    toggleItem={() => this.toggleItem('doi')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'publishedIn'}
                                    label="Published in"
                                    type="publishedIn"
                                    value={this.state.publishedIn}
                                    onChange={this.handleVenueChange}
                                    toggleItem={() => this.toggleItem('publishedIn')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'researchField'}
                                    label="Research Field"
                                    type="researchField"
                                    value={this.state.researchField}
                                    onChange={this.handleResearchFieldChange}
                                    toggleItem={() => this.toggleItem('researchField')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'url'}
                                    isLastItem={true}
                                    label="Paper URL"
                                    type="text"
                                    value={this.state.url}
                                    onChange={e => this.handleChange(e, 'url')}
                                    toggleItem={() => this.toggleItem('url')}
                                />
                            </ListGroup>

                            <Button disabled={this.state.isLoading} color="primary" className="float-right mt-2 mb-2" onClick={this.handleSave}>
                                Save
                            </Button>
                        </ModalBody>
                    </LoadingOverlayStyled>
                </Modal>
            </>
        );
    }
}

EditPaperDialog.propTypes = {
    updateMetaInformationStore: PropTypes.func.isRequired,
    updateMetaInformationAuthors: PropTypes.func.isRequired,
    loadPaper: PropTypes.func.isRequired,
    viewPaper: PropTypes.shape({
        paperResourceId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        publicationMonth: PropTypes.number.isRequired,
        publicationYear: PropTypes.number.isRequired,
        doi: PropTypes.string.isRequired,
        publishedIn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        url: PropTypes.string,
        researchField: PropTypes.object.isRequired,
        authors: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            }).isRequired
        ).isRequired
    }).isRequired
};

const mapStateToProps = state => ({
    viewPaper: state.viewPaper
});

const mapDispatchToProps = dispatch => ({
    loadPaper: payload => dispatch(loadPaper(payload)),
    updateMetaInformationStore: payload => dispatch(updateMetaInformationStore(payload)),
    updateMetaInformationAuthors: payload => dispatch(updateMetaInformationAuthors(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditPaperDialog);
