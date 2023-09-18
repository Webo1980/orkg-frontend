import { CLASSES, RESOURCES, PREDICATES } from 'constants/graphSettings';
import Tippy from '@tippyjs/react';
import { faSpinner, faXmark, faQuestionCircle, faSync, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Cite } from '@citation-js/core';
import AutocompleteContentTypeTitle from 'components/AutocompleteContentTypeTitle/AutocompleteContentTypeTitle';
import useList from 'components/List/hooks/useList';
import MetadataTable from 'components/List/MetadataTable/MetadataTable';
import PropTypes from 'prop-types';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { Table, Button, ButtonGroup, FormGroup, Input, InputGroup } from 'reactstrap';
import { getPaperByDOI, getPaperByTitle } from 'services/backend/misc';
import { saveFullPaper } from 'services/backend/papers';
import { getStatementsBySubject } from 'services/backend/statements';
import { parseCiteResult } from 'utils';
import env from '@beam-australia/react-env';
import ManageComparisonWizard from './ManageComparisonWizard';

// CSS styles for the loading container
const loadingContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999, // Ensure the loading overlay is on top of everything else
};
const loadingIconStyles = {
    animation: 'spin 1s linear infinite', // This applies the spin animation to the loading icon
    size: '50 px',
};

const ComparisonWizardForm = ({ setIsOpen, onDataChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCite, setIsLoadingCite] = useState(false);
    const [title, setTitle] = useState('');
    const [returnedData, setReturnedData] = useState([]);
    const [collectedData, setCollectedData] = useState('');
    const [returnedDoiMetadata, setReturnedDoiMetadata] = useState('');
    const [linkOpened, setLinkOpened] = useState(false);
    const [doi, setDoi] = useState('');
    const [abstract, setAbstract] = useState('');
    const [pdfURL, setPdfURL] = useState('');
    const [bibTex, setBibTex] = useState('');
    const [tab, setTab] = useState('file');
    const [results, setResults] = useState([]);
    const [addedItems, setAddedItems] = useState([]);
    const sections = useSelector(state => state.list.sections);
    const dispatch = useDispatch();
    const { getContentTypeData } = useList();
    const manageComparison = ManageComparisonWizard();
    const {
        isBackEndLoading,
        researchProblems,
        submitted,
        sendComparisonDataToBackend,
        sendTitlePDFURL,
        titlePDFURL,
        sendDoiData,
        doiData,
        sendAbstractData,
        abstractData,
        sendPDFURL,
        pdfDownloadable,
        DraggableResizableDiv,
    } = manageComparison;
    const [dataObject, setDataObject] = useState({
        uploadedFiles: [], // Initialize with an empty array
    });
    const UploadPdf = lazy(() => import('./UploadData')); // for dependency "pdfjs-dist" ~2.91MB
    const handleDataUpload = newFiles => {
        const updatedUploadedFiles = {};
        for (const [key, fileObj] of Object.entries(newFiles)) {
            const reader = new FileReader();
            reader.onload = event => {
                const updatedFileObj = {
                    name: fileObj.name, // Ensure that name is set correctly
                    content: event.target.result, // Set the content property
                };
                updatedUploadedFiles[key] = updatedFileObj;
                setDataObject(prevData => ({
                    ...prevData,
                    uploadedFiles: updatedUploadedFiles,
                }));
            };
            reader.readAsDataURL(fileObj);
        }
    };

    useEffect(() => {
        if (Object.keys(titlePDFURL).length > 0) {
            const updatedResults = results.map(result => ({
                ...result,
                pdfFile: titlePDFURL[0].pdfFile,
            }));
            setResults(updatedResults);
            setReturnedData(updatedResults);
        }
    }, [titlePDFURL]);

    useEffect(() => {
        if (Object.keys(doiData).length > 0) {
            setReturnedData([doiData]);
            setIsLoadingCite(false);
        }
        console.log(returnedData);
    }, [doiData]);

    useEffect(() => {
        if (Object.keys(abstractData).length > 0) {
            console.log([abstractData]);
            setReturnedData([abstractData]);
            setIsLoadingCite(false);
        }
    }, [abstractData]);

    useEffect(() => {
        if (Object.keys(pdfDownloadable).length > 0) {
            setReturnedData(pdfDownloadable);
            setIsLoadingCite(false);
        }
    }, [pdfDownloadable]);
    useEffect(() => {
        // Combine uploaded files' data with added items
        const newItems = Object.entries(dataObject.uploadedFiles).map(([key, fileObj]) => {
            const newItem = {
                type: 'File',
                value: fileObj.name,
                content: fileObj.content, // Add the content of the file
            };
            return newItem;
        });
        setAddedItems(prevItems => [...prevItems, ...newItems]);
    }, [dataObject.uploadedFiles]);

    const handleAddItem = () => {
        let itemType;
        let file;
        const words = collectedData.trim().split(' ');
        const wordCount = words.length;
        if (wordCount >= 7 && wordCount <= 20) {
            itemType = 'Title';
            file = returnedData[0]?.pdfFile || '';
        } else if (collectedData.startsWith('@')) {
            itemType = 'BibTex';
            file = returnedData[0]?.pdfFile || '';
        } else if (collectedData.startsWith('https://doi.org/') || collectedData.match(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i)) {
            // Check for DOI URL
            itemType = 'DOI';
            file = returnedData[0]?.pdfFile || '';
        } else if (collectedData.startsWith('http')) {
            // Check for regular URL
            itemType = 'URL';
            file = returnedData[0]?.pdfFile || '';
        } else if (collectedData.split(' ').length > 100) {
            // Check for Abstract
            itemType = 'Abstract';
            file = returnedData[0]?.pdfFile || '';
        } else {
            // Invalid input
            // Handle error or provide appropriate feedback
            return;
        }
        // Construct the new item object
        const newItem = {
            type: itemType,
            value: collectedData,
            file,
        };
        // Check if the item already exists in the addedItems list
        const itemExists = addedItems.some(item => item.value === collectedData);
        if (!itemExists) {
            // Update the addedItems state
            setAddedItems([...addedItems, newItem]);
            toast.success('The entry was added successfully to the data box');
        }
        // Clear the inputText
        setCollectedData('');
    };

    const handleRemoveItem = index => {
        // Remove the item at the specified index from the addedItems list
        const updatedItems = addedItems.filter((_, i) => i !== index);
        setAddedItems(updatedItems);
        toast.success('The entry was deleted successfully from the data box');
    };

    const getPaperIdByDoi = async doi => {
        try {
            const paper = await getPaperByDOI(doi);
            return paper.id;
        } catch (e) {
            return null;
        }
    };

    const getPaperIdByTitle = async title => {
        try {
            const paper = await getPaperByTitle(title);
            return paper.id;
        } catch (e) {
            return null;
        }
    };

    const handleAdd = async () => {
        for (const entity of results) {
            const _entity = { ...entity };
            // entity does not yet exist, create it before proceeding
            if (!entity.existingContentTypeId) {
                const savedPaper = await saveFullPaper(
                    {
                        paper: {
                            title: entity.title,
                            researchField: RESOURCES.RESEARCH_FIELD_MAIN,
                            authors: entity.authors
                                ? entity.authors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) }))
                                : null,
                            publicationMonth: entity.publicationMonth || undefined,
                            publicationYear: entity.publicationYear || undefined,
                            doi: doi || undefined,
                            publishedIn: entity.publishedIn || undefined,
                            contributions: [
                                {
                                    name: 'Contribution',
                                },
                            ],
                        },
                    },
                    true,
                );
                _entity.existingContentTypeId = savedPaper.id;
            }
        }
    };
    const fetchDataByDoi = async value => {
        setIsLoadingCite(true);
        const entryParsed = value.trim();
        await sendDoiData(entryParsed, `${env('COMPARISON_WIZARD_API')}get_meta_data_by_doi`);
    };

    const fetchDataByAbstract = async value => {
        setIsLoadingCite(true);
        const entryParsed = value.trim();
        await sendAbstractData(entryParsed, `${env('COMPARISON_WIZARD_API')}get_meta_data_by_abstract`);
    };

    const checkPDFURL = async value => {
        if (value !== '') {
            setIsLoadingCite(true);
            const entryParsed = value.trim();
            await sendPDFURL(entryParsed, `${env('COMPARISON_WIZARD_API')}check_pdf_url`);
        }
    };

    // for now parsed bibtex and DOIs are always considered as papers
    const handleParse = async value => {
        setIsLoadingCite(true);
        try {
            const _results = [];
            const entryParsed = value.trim();

            const papers = await Cite.async(entryParsed);

            if (!papers) {
                toast.error('An error occurred');
                setIsLoading(false);
                return;
            }
            for (const paper of papers.data) {
                let paperId = null;
                const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = parseCiteResult({
                    data: [paper],
                });
                if (doi) {
                    paperId = await getPaperIdByDoi(doi);
                }
                if (paperTitle && !paperId) {
                    paperId = await getPaperIdByTitle(paperTitle);
                }
                if (paperId) {
                    _results.push(await getMetaData(paperId));
                } else {
                    _results.push({
                        title: paperTitle,
                        authors: paperAuthors,
                        paperPublicationMonth,
                        paperPublicationYear,
                        doi,
                        publishedIn,
                        paperId,
                    });
                }
            }
            console.log(_results);
            setResults(_results);
            console.log(_results);
            await sendTitlePDFURL(_results[0].title, `${env('COMPARISON_WIZARD_API')}get_pdf_by_title`);
        } catch (e) {
            const validationMessages = {
                'This format is not supported or recognized':
                    "This format is not supported or recognized. Please enter a valid DOI or Bibtex or select 'Manual entry' to enter the paper details yourself",
                'Server responded with status code 404': 'No paper has been found',
                default: 'An error occurred, reload the page and try again',
            };
            console.log(e);
            toast.error(validationMessages[e.message] || validationMessages.default);
            setIsLoading(false);
            return;
        } finally {
            setIsLoadingCite(false);
        }
    };

    const handleAutocompleteSelect = async selected => {
        setTitle(selected.label);
        setCollectedData(selected.label);

        // check if is existing
        if (selected.isOrkgResource) {
            setResults([await getMetaData(selected.id)]);
        } else {
            setResults([
                {
                    title: selected.title,
                    paperPublicationYear: selected.year,
                    authors: selected.authors?.map(author => ({ label: author.name })),
                    venue: selected.venue,
                },
            ]);
        }
        await sendTitlePDFURL(selected.label, `${env('COMPARISON_WIZARD_API')}get_pdf_by_title`);
    };

    const getMetaData = async id => {
        const statements = await getStatementsBySubject({ id });
        return {
            title: statements[0]?.subject?.label,
            authors: statements
                .filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR)
                .map(authorStatement => ({ label: authorStatement.object.label }))
                .reverse(),
            paperPublicationMonth: statements.find(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_MONTH)?.object.label ?? null,
            paperPublicationYear: statements.find(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR)?.object.label,
            doi: statements.find(statement => statement.predicate.id === PREDICATES.HAS_DOI)?.object.label,
            publishedIn: statements.find(statement => statement.predicate.id === PREDICATES.HAS_VENUE)?.object.label,
            existingContentTypeId: id,
        };
    };

    const switchTab = _tab => {
        if (tab === _tab) {
            return;
        }
        setTab(_tab);
        setResults([]);
        setLinkOpened(false);
        setReturnedData([]);
    };
    const isButtonDisabled = () => !linkOpened;
    const handleFormSubmit = async e => {
        e.preventDefault();
        const formData = new FormData();
        const pdfItems = addedItems.filter(item => item.type === 'File' && item.content.startsWith('data:application/pdf;base64,'));
        const otherItems = addedItems.filter(item => item.type !== 'File' || !item.content.startsWith('data:application/pdf;base64,'));
        // Append pdfItems to formData
        pdfItems.forEach(item => {
            const base64Data = item.content.substring('data:application/pdf;base64,'.length);
            const binaryContent = atob(base64Data);
            const contentSizeInBytes = binaryContent.length;
            const byteArray = new Uint8Array(contentSizeInBytes);
            for (let i = 0; i < contentSizeInBytes; i++) {
                byteArray[i] = binaryContent.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            formData.append('files', blob, item.value);
        });
        // Append otherItems to formData as JSON
        if (otherItems.length > 0) {
            const otherItemsData = otherItems.map(item => ({ type: item.type, value: item.value, file: item.file }));
            const otherItemsBlob = new Blob([JSON.stringify(otherItemsData)], { type: 'application/json' });
            formData.append('data', otherItemsBlob, 'data.json');
        }
        // Send data to the backend and await the response
        const response = await sendComparisonDataToBackend(formData, `${env('COMPARISON_WIZARD_API')}get_research_problems`);
        // Extract research_problems from the response
        const researchProblemsData = response;
        const dataToSend = {
            researchProblems: researchProblemsData,
            submitted: true,
        };
        // Send data to the parent component via callback
        onDataChange(dataToSend);
    };
    const dataBox = () => (
        <>
            {Object.keys(addedItems).length > 0 && (
                <DraggableResizableDiv initialWidth={550} initialHeight={200} left="55%" top="25%" headText="Data Box">
                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Data</th>
                                    <th>PDF URL</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addedItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.type}</td>
                                        <td style={{ maxWidth: '150px', maxHeight: '150px', overflowX: 'auto' }}>
                                            <div style={{ maxWidth: '150px', maxHeight: '150px', overflowY: 'auto' }}>{item.value}</div>
                                        </td>
                                        <td style={{ maxWidth: '150px', maxHeight: '150px', overflowX: 'auto' }}>
                                            <div style={{ maxWidth: '150px', maxHeight: '150px', overflowY: 'auto' }}>{item.file}</div>
                                        </td>
                                        <td>
                                            <Icon
                                                icon={faXmark}
                                                onClick={() => handleRemoveItem(index)}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                    backgroundColor: 'rgb(207, 48, 19)',
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DraggableResizableDiv>
            )}
        </>
    );

    return (
        <>
            <div style={{ position: 'relative' }}>
                {isBackEndLoading && (
                    // Show loading message and icon when loading is true
                    <div style={loadingContainerStyles}>
                        <style>
                            {`
                        @keyframes spin {
                            0% {
                            transform: rotate(0deg);
                            }
                            100% {
                            transform: rotate(360deg);
                            }
                        }
                        `}
                        </style>
                        <Icon icon={faSync} className="me-1 loading-icon" style={loadingIconStyles} />
                    </div>
                )}
                <div>
                    <ButtonGroup className="w-100 mb-4">
                        <Button size="sm" color={tab === 'file' ? 'primary' : 'light'} style={{ marginRight: 2 }} onClick={() => switchTab('file')}>
                            Upload PDF File (Recomended)
                        </Button>
                        <Button
                            size="sm"
                            color={tab === 'pdfURL' ? 'primary' : 'light'}
                            style={{ marginRight: 2 }}
                            onClick={() => switchTab('pdfURL')}
                        >
                            Article PDF URL (Recomended)
                        </Button>
                        <Button size="sm" color={tab === 'title' ? 'primary' : 'light'} style={{ marginRight: 2 }} onClick={() => switchTab('title')}>
                            Title
                        </Button>
                        <Button size="sm" color={tab === 'doi' ? 'primary' : 'light'} style={{ marginRight: 2 }} onClick={() => switchTab('doi')}>
                            DOI
                        </Button>
                        <Button size="sm" color={tab === 'bibtex' ? 'primary' : 'light'} onClick={() => switchTab('bibtex')}>
                            BibTeX
                        </Button>
                        <Button
                            size="sm"
                            color={tab === 'abstract' ? 'primary' : 'light'}
                            style={{ marginRight: 2 }}
                            onClick={() => switchTab('abstract')}
                        >
                            Abstract
                        </Button>
                    </ButtonGroup>
                    {tab === 'title' && (
                        <FormGroup>
                            <InputGroup>
                                <div className="form-control form-control p-0 border-0">
                                    <AutocompleteContentTypeTitle
                                        contentType={CLASSES.PAPER}
                                        value={title}
                                        onChange={v => {
                                            setTitle(v);
                                        }}
                                        onOptionClick={handleAutocompleteSelect}
                                        performExistingPaperLookup={false}
                                        performOrkgLookup={true}
                                        placeholder="Enter a title"
                                        borderRadius="0 6px 6px 0"
                                    />
                                </div>
                            </InputGroup>
                        </FormGroup>
                    )}
                    {tab === 'doi' && (
                        <FormGroup>
                            <InputGroup>
                                <Input
                                    value={doi}
                                    placeholder="Enter DOIs, whitespace separated"
                                    className="form-control"
                                    onChange={e => {
                                        setDoi(e.target.value);
                                        setCollectedData(e.target.value);
                                    }}
                                />
                                <Button
                                    outline
                                    color="primary"
                                    style={{ minWidth: 130 }}
                                    disabled={isLoadingCite}
                                    onClick={() => fetchDataByDoi(doi)}
                                >
                                    {!isLoadingCite ? 'Lookup' : <Icon icon={faSpinner} spin />}
                                </Button>
                            </InputGroup>
                        </FormGroup>
                    )}
                    {tab === 'bibtex' && (
                        <FormGroup>
                            <InputGroup>
                                <Textarea
                                    placeholder="Enter BibTeX"
                                    value={bibTex}
                                    minRows="3"
                                    maxRows="10"
                                    className="form-control"
                                    onChange={e => {
                                        setBibTex(e.target.value);
                                        setCollectedData(e.target.value);
                                    }}
                                />
                            </InputGroup>
                            <Button color="secondary" size="sm" className="mt-2" disabled={isLoadingCite} onClick={() => handleParse(bibTex)}>
                                {!isLoadingCite ? 'Parse' : <Icon icon={faSpinner} spin />}
                            </Button>
                        </FormGroup>
                    )}
                    {tab === 'abstract' && (
                        <FormGroup>
                            <InputGroup>
                                <Textarea
                                    placeholder="Enter Abstract"
                                    value={abstract}
                                    minRows="3"
                                    maxRows="10"
                                    className="form-control"
                                    onChange={e => {
                                        setAbstract(e.target.value);
                                        setCollectedData(e.target.value);
                                    }}
                                />
                            </InputGroup>
                            <Button
                                color="secondary"
                                size="sm"
                                className="mt-2"
                                disabled={isLoadingCite}
                                onClick={() => fetchDataByAbstract(abstract)}
                            >
                                {!isLoadingCite ? 'Parse' : <Icon icon={faSpinner} spin />}
                            </Button>
                        </FormGroup>
                    )}
                    {tab === 'pdfURL' && (
                        <FormGroup>
                            <InputGroup>
                                <Input
                                    placeholder="Enter Article PDF URL"
                                    value={pdfURL}
                                    minRows="3"
                                    className="form-control"
                                    onChange={e => {
                                        setPdfURL(e.target.value);
                                        setCollectedData(e.target.value);
                                    }}
                                />
                                <Button
                                    outline
                                    color="primary"
                                    style={{ minWidth: 130 }}
                                    disabled={isLoadingCite}
                                    onClick={() => checkPDFURL(pdfURL)}
                                >
                                    {!isLoadingCite ? 'Check' : <Icon icon={faSpinner} spin />}
                                </Button>
                            </InputGroup>
                        </FormGroup>
                    )}
                    {tab === 'file' && (
                        <FormGroup>
                            <InputGroup style={{ left: '430px' }}>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <UploadPdf onDataUpload={handleDataUpload} />
                                </Suspense>
                            </InputGroup>
                        </FormGroup>
                    )}
                    {Object.keys(returnedData).length > 0 &&
                        returnedData.map((result, index) => (
                            <div key={index}>
                                <MetadataTable
                                    title={result?.title}
                                    authors={result?.authors}
                                    publicationMonth={result?.paperPublicationMonth || ''}
                                    publicationYear={result?.paperPublicationYear || ''}
                                    venue={result?.publishedIn || ''}
                                    contentTypeId={result?.existingContentTypeId}
                                    pdfFile={
                                        result?.pdfFile &&
                                        (result.pdfFile?.startsWith('http') ? (
                                            <a href={result.pdfFile} target="_blank" rel="noopener noreferrer" onClick={() => setLinkOpened(true)}>
                                                {result.pdfFile} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        ) : result.pdfFile === 'The file is downloadable' ? (
                                            result.pdfFile // Render the file is downloadable message
                                        ) : (
                                            <div>
                                                {result.pdfFile}. We recommend you to upload your file under this&nbsp;
                                                <a
                                                    href="#"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        switchTab('file');
                                                    }}
                                                >
                                                    tab
                                                </a>
                                                , or add a direct link to your PDF under the Article PDF URL&nbsp;
                                                <a
                                                    href="#"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        switchTab('pdfURL');
                                                    }}
                                                >
                                                    tab
                                                </a>
                                                .
                                            </div>
                                        ))
                                    }
                                />
                            </div>
                        ))}
                    {tab !== 'file' && (
                        <div>
                            <span>
                                <Button
                                    color="primary"
                                    className="float-end"
                                    onClick={handleAddItem}
                                    disabled={returnedData[0]?.pdfFile === 'The file is downloadable' ? false : isButtonDisabled()}
                                >
                                    Add
                                </Button>
                            </span>
                            {Object.keys(returnedData).length > 0 && returnedData[0].pdfFile?.startsWith('http') && (
                                <span>
                                    <Tippy content="Please double-check that the Paper PDF URL is the corresponding file. When you click on the paper link the add button will be activated. If you find the file that is not what you want to compare, click on Article PDF URL and add the URL or you can upload the file by clicking on the tab File">
                                        <Icon icon={faQuestionCircle} style={{ marginLeft: '5px' }} />
                                    </Tippy>
                                </span>
                            )}
                        </div>
                    )}
                    <form onSubmit={handleFormSubmit}>
                        <Table bordered hover className="m-0">
                            <tbody>
                                <tr style={{ backgroundColor: '#f7eaec' }}>
                                    <td colSpan={2}>
                                        <Button type="submit" disabled={addedItems.length < 3}>
                                            Compare Entries
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </form>
                    {dataBox()}
                </div>
            </div>
        </>
    );
};

ComparisonWizardForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    onDataChange: PropTypes.func.isRequired, // Callback for sending data to the parent
};

export default ComparisonWizardForm;
