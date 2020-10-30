import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Alert,
    Input,
    ModalFooter,
    Button,
    FormGroup,
    Label,
    ButtonGroup,
    InputGroupAddon,
    InputGroup
} from 'reactstrap';
import { saveFullPaper } from 'services/backend/misc';
import { CLASSES, PREDICATES, MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import Cite from 'citation-js';
import { parseCiteResult } from 'utils';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Save = props => {
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const documentHash = useSelector(state => state.pdfTextAnnotation.documentHash);
    const [title, setTitle] = useState('');
    const [doi, setDoi] = useState('');
    const [paperId, setPaperId] = useState(null);
    const [saveBy, setSaveBy] = useState('doi');
    const [doiIsFetching, setDoiIsFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paperData, setPaperData] = useState({
        paperTitle: null,
        paperAuthors: [],
        paperPublicationMonth: null,
        paperPublicationYear: null,
        doi: null,
        publishedIn: null
    });

    const createBoundingRect = ({ height, width, x1, x2, y1, y2 }) => {
        return {
            [PREDICATES.HEIGHT]: [
                {
                    text: height
                }
            ],
            [PREDICATES.WIDTH]: [
                {
                    text: width
                }
            ],
            [PREDICATES.X_1]: [
                {
                    text: x1
                }
            ],
            [PREDICATES.X_2]: [
                {
                    text: x2
                }
            ],
            [PREDICATES.Y_1]: [
                {
                    text: y1
                }
            ],
            [PREDICATES.Y_2]: [
                {
                    text: y2
                }
            ]
        };
    };

    const createAnnotation = annotation => ({
        label: annotation.type,
        classes: [annotation.type, CLASSES.SENTENCE],
        values: {
            [PREDICATES.HAS_CONTENT]: [
                {
                    text: annotation.content.text
                }
            ],
            [PREDICATES.POSITION]: [
                {
                    label: 'Position',
                    values: {
                        [PREDICATES.PAGE_NUMBER]: [
                            {
                                text: annotation.position.pageNumber
                            }
                        ],
                        [PREDICATES.BOUNDING_RECT]: [
                            {
                                label: 'Bounding rect',
                                values: createBoundingRect({
                                    height: annotation.position.boundingRect.height,
                                    width: annotation.position.boundingRect.width,
                                    x1: annotation.position.boundingRect.x1,
                                    x2: annotation.position.boundingRect.x2,
                                    y1: annotation.position.boundingRect.y1,
                                    y2: annotation.position.boundingRect.y2
                                })
                            }
                        ],
                        [PREDICATES.RECTS]: annotation.position.rects.map(rect => ({
                            label: 'Rect',
                            values: createBoundingRect({
                                height: rect.height,
                                width: rect.width,
                                x1: rect.x1,
                                x2: rect.x2,
                                y1: rect.y1,
                                y2: rect.y2
                            })
                        }))
                    }
                }
            ]
        }
    });

    const handleSave = async () => {
        const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = paperData;
        const _title = saveBy === 'doi' ? paperTitle : title;

        if (!_title) {
            if (saveBy === 'doi') {
                toast.error("The DOI data is not fetched. Enter a valid DOI and click 'Lookup'");
            } else {
                toast.error('Please enter a paper title');
            }
            return;
        }
        setIsLoading(true);

        const contributionStatements = {
            [PREDICATES.DOCUMENT_HASH]: [
                {
                    text: documentHash
                }
            ]
        };

        for (const annotation of annotations) {
            if (!(PREDICATES.CONTAINS in contributionStatements)) {
                contributionStatements[PREDICATES.CONTAINS] = [];
            }
            contributionStatements[PREDICATES.CONTAINS].push({
                ...createAnnotation(annotation)
            });
        }

        const paper = {
            title: _title,
            researchField: MISC.RESEARCH_FIELD_MAIN,
            authors: paperAuthors.length
                ? paperAuthors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) }))
                : null,
            publicationMonth: paperPublicationMonth,
            publicationYear: paperPublicationYear,
            doi,
            publishedIn,
            contributions: [
                {
                    name: 'Contribution',
                    values: contributionStatements
                }
            ]
        };

        const savedPaper = await saveFullPaper({ paper: paper }, true);

        setIsLoading(false);
        setPaperId(savedPaper.id);
    };

    const fetchDoi = async () => {
        if (!doi) {
            toast.error('Please enter a DOI');
            return;
        }

        setDoiIsFetching(true);

        await Cite.async(doi)
            .catch(e => {
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        toast.error('This format is not supported or recognized');
                        break;
                    case 'Server responded with status code 404':
                        toast.error('No paper has been found');

                        break;
                    default:
                        toast.error('An error occurred, reload the page and try again');
                        break;
                }
                setDoiIsFetching(false);
                return null;
            })
            .then(paper => {
                if (paper) {
                    const parseResult = parseCiteResult(paper);
                    const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = parseResult;

                    setPaperData({
                        paperTitle,
                        paperAuthors,
                        paperPublicationMonth,
                        paperPublicationYear,
                        doi,
                        publishedIn
                    });
                    setDoiIsFetching(false);
                }
            });
    };

    const handleClose = () => {
        props.toggle();
        setPaperId(null);
    };

    return (
        <Modal isOpen={props.isOpen} toggle={handleClose}>
            <ModalHeader toggle={handleClose}>Save annotations</ModalHeader>
            <ModalBody>
                {!paperId ? (
                    annotations.length > 0 ? (
                        <>
                            <Label for="exampleUrl">Add paper by</Label>
                            <br />
                            <ButtonGroup size="sm">
                                <Button color={saveBy === 'doi' ? 'primary' : 'light'} onClick={() => setSaveBy('doi')}>
                                    Paper DOI
                                </Button>
                                <Button color={saveBy === 'title' ? 'primary' : 'light'} onClick={() => setSaveBy('title')}>
                                    Paper title
                                </Button>
                            </ButtonGroup>
                            <hr />
                            {saveBy === 'doi' && (
                                <>
                                    <FormGroup>
                                        <Label for="exampleUrl">Paper DOI</Label>
                                        <InputGroup id="doiInputGroup">
                                            <Input type="url" name="url" value={doi} onChange={e => setDoi(e.target.value)} />
                                            <InputGroupAddon addonType="append">
                                                <Button
                                                    outline
                                                    color="primary"
                                                    style={{ minWidth: 130 }}
                                                    onClick={fetchDoi}
                                                    disabled={doiIsFetching}
                                                    data-test="lookupDoi"
                                                >
                                                    {!doiIsFetching ? 'Lookup' : <Icon icon={faSpinner} spin />}
                                                </Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </FormGroup>
                                    {paperData.paperTitle && (
                                        <p>
                                            <strong>Paper title:</strong> {paperData.paperTitle}
                                        </p>
                                    )}
                                </>
                            )}
                            {saveBy === 'title' && (
                                <FormGroup>
                                    <Label for="exampleUrl">Paper title</Label>
                                    <Input type="url" name="url" value={title} onChange={e => setTitle(e.target.value)} />
                                </FormGroup>
                            )}
                        </>
                    ) : (
                        <Alert color="danger">You didn't make any annotations yet, so there is nothing to save</Alert>
                    )
                ) : (
                    <Alert color="success">
                        Annotations successfully saved{' '}
                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>click here to view the paper</Link>
                    </Alert>
                )}
            </ModalBody>
            {annotations.length && !paperId ? (
                <ModalFooter>
                    <Button color="primary" onClick={handleSave} disabled={isLoading}>
                        {!isLoading ? 'Save' : <Icon icon={faSpinner} spin />}
                    </Button>
                </ModalFooter>
            ) : null}
        </Modal>
    );
};

Save.propTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default Save;
