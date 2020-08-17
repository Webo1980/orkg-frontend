import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { createResource, createLiteralStatement, createLiteral, getComparison } from 'network';
import { getContributionIdsFromUrl } from 'utils';
import PublishWithDOI from 'components/Comparison/PublishWithDOI';
import Tooltip from 'components/Utils/Tooltip';
import AuthorsInput from 'components/Utils/AuthorsInput';
import { generateDOIForComparison } from 'network';
import queryString from 'query-string';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

const StyledCustomInput = styled(CustomInput)`
    margin-right: 0;
`;

class Publish extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            reference: '',
            subject: this.props.subject,
            doi: '',
            comparisonLink: props.url,
            comparisonId: props.comparisonId,
            creators: [{ creator: '', ORCID: '' }],
            isWarningModalOpen: false,
            showPublishWithDOIDialog: false,
            isCreatingDOI: false,
            isLoading: false,
            comparisonCreators: [],
            assignDOI: false
        };
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleAuthorsChange = creators => {
        console.log(creators);
        creators = creators ? creators : [];
        this.setState({
            comparisonCreators: creators
        });
    };

    publishDOI = async (comparisonId, comparisonLink) => {
        try {
            if (this.state.title && this.state.title.trim() !== '' && this.state.description && this.state.description.trim() !== '') {
                const response = await generateDOIForComparison(
                    comparisonId,
                    this.state.title,
                    this.state.subject,
                    this.state.description,
                    getContributionIdsFromUrl(this.props.location),
                    this.state.comparisonCreators.map(c => ({ creator: c.label, ORCID: c.orcid })),
                    comparisonLink
                );
                this.setState({ doi: response.data.attributes.doi });
                toast.success('DOI has been registered successfully');
            } else {
                throw Error('Please enter a title and a description');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isLoading: false });
        }
    };

    handleSubmit = async e => {
        this.setState({ isLoading: true });
        try {
            if (this.state.title && this.state.title.trim() !== '' && this.state.description && this.state.description.trim() !== '') {
                const contributionIds = getContributionIdsFromUrl(this.props.url.substring(this.props.url.indexOf('?')));
                const comparison = await getComparison({ contributionIds: contributionIds, save_response: true });
                const titleResponse = await createResource(this.state.title, [CLASSES.COMPARISON]);
                const resourceId = titleResponse.id;
                const descriptionResponse = await createLiteral(this.state.description);
                await createLiteralStatement(resourceId, PREDICATES.DESCRIPTION, descriptionResponse.id);
                if (this.state.reference && this.state.reference.trim() !== '') {
                    const referenceResponse = await createLiteral(this.state.reference);
                    await createLiteralStatement(resourceId, PREDICATES.REFERENCE, referenceResponse.id);
                }

                await this.saveCreators(this.state.comparisonCreators, resourceId);
                let link = queryString.parse(this.props.url).response_hash
                    ? this.props.url
                    : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${comparison.response_hash}`;
                link = link.substring(link.indexOf('?'));
                const urlResponse = await createLiteral(link);
                await createLiteralStatement(resourceId, PREDICATES.URL, urlResponse.id);

                toast.success('Comparison saved successfully');
                const comparisonLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
                    .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
                    .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON, { comparisonId: resourceId })}`;
                // Assign a DOI
                if (this.state.assignDOI) {
                    console.log('assign DOI');
                    this.publishDOI(resourceId, comparisonLink);
                }
                this.setState({
                    isLoading: false,
                    comparisonId: resourceId,
                    comparisonLink: comparisonLink
                });
                this.props.updateComparisonMetadata(
                    this.state.title,
                    this.state.description,
                    this.state.reference,
                    this.state.subject,
                    this.state.comparisonCreators,
                    this.state.comparisonLink
                );
            } else {
                throw Error('Please enter a title and a description');
            }
        } catch (error) {
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isLoading: false });
        }
        e.preventDefault();
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    updateDOIState = doi => {
        this.setState({ doi });
    };

    publishComparison = async e => {
        this.setState({ isCreatingDOI: true });
        try {
            if (this.state.comparisonId && this.props.authors.length === 0) {
                await this.saveCreators(this.state.creators, this.state.comparisonId);
            }
            this.toggle('showPublishWithDOIDialog');
            this.setState({ isCreatingDOI: false });
        } catch (error) {
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isCreatingDOI: false });
        }
        e.preventDefault();
    };

    saveCreators = async (creators, resourceId) => {
        // Check if the author is in ORKG
        creators.map(async c => {
            const creator = await createResource(c.label, [CLASSES.AUTHOR]);
            await createLiteralStatement(resourceId, PREDICATES.HAS_AUTHOR, creator.id);
            if (c.orcid !== '') {
                const ORCID = await createLiteral(c.orcid);
                await createLiteralStatement(creator.id, PREDICATES.HAS_ORCID, ORCID.id);
            }
        });
    };

    handleSwitchIsStrictTemplate = event => {
        this.setState(prevState => ({
            assignDOI: !prevState.assignDOI
        }));
    };

    render() {
        const comparisonLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
            .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
            .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId || this.state.comparisonId })}`;

        return (
            <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Publish comparison</ModalHeader>
                <ModalBody>
                    <Alert color="info">
                        A published comparison is made public to other users. The state of the comparison is saved and a persistent link is created.
                    </Alert>
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Enter the title of the comparison">Title</Tooltip>
                            </Label>
                            <Input type="text" name="title" disabled={Boolean(this.state.doi)} id="title" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">
                                <Tooltip message="Describe the goal and what is being compared">Description</Tooltip>
                            </Label>
                            <Input
                                type="textarea"
                                name="description"
                                disabled={Boolean(this.state.doi)}
                                id="description"
                                onChange={this.handleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="reference">
                                <Tooltip message="Enter a reference to the paper from which the comparison is generated">
                                    Reference (optional)
                                </Tooltip>
                            </Label>
                            <Input type="text" name="reference" id="reference" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="subject">
                                <Tooltip message="Enter a subject of the comparison">Subject</Tooltip>
                            </Label>
                            <Input type="text" name="subject" id="subject" onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="Creator">
                                <Tooltip message="Name of the creator">Creators</Tooltip>
                            </Label>
                            <AuthorsInput itemLabel="creator" handler={this.handleAuthorsChange} value={this.state.comparisonCreators} />
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <Tooltip
                                    message="A DOI will be assigned to published comparison and it
                        cannot be changed in future."
                                >
                                    <StyledCustomInput
                                        onChange={this.handleSwitchIsStrictTemplate}
                                        checked={this.state.assignDOI}
                                        id="switchAssignDoi"
                                        type="switch"
                                        name="customSwitch"
                                        inline
                                        label="Assign a DOI to the comparison"
                                    />
                                </Tooltip>
                            </div>
                        </FormGroup>
                    </>
                    <>
                        {this.state.comparisonId && this.props.authors.length > 0 && (
                            <FormGroup>
                                <Label for="persistent_link">Comparison link</Label>
                                <Input value={comparisonLink} disabled />
                            </FormGroup>
                        )}
                        {this.state.doi && (
                            <FormGroup>
                                <Label for="persistent_link">DOI</Label>
                                <Input value={this.props.doi} disabled />
                            </FormGroup>
                        )}
                    </>
                </ModalBody>
                <ModalFooter>
                    <div className="text-align-center mt-2">
                        <Button color="primary" disabled={this.state.isLoading} onClick={this.handleSubmit}>
                            {this.state.isLoading && <span className="fa fa-spinner fa-spin" />}{' '}
                            {!this.props.comparisonId && !this.props.doi ? 'Publish' : 'Publish DOI'}
                        </Button>
                    </div>
                </ModalFooter>
                <PublishWithDOI
                    showPublishWithDOIDialog={this.state.showPublishWithDOIDialog}
                    DOIToggle={() => this.toggle('showPublishWithDOIDialog')}
                    url={this.state.comparisonLink}
                    location={this.props.location}
                    response_hash={this.state.response_hash}
                    comparisonId={this.state.comparisonId}
                    title={this.props.title}
                    description={this.props.description}
                    creators={this.props.authors.length > 0 ? this.props.authors : this.state.creators}
                    subject={this.props.subject}
                    updateDOIState={this.updateDOIState}
                />
            </Modal>
        );
    }
}

Publish.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    title: PropTypes.string,
    subject: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    doi: PropTypes.string,
    updateComparisonMetadata: PropTypes.func.isRequired
};

export default connect()(Publish);
