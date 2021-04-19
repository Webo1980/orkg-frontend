import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup } from 'reactstrap';
import { semantifyBioassays } from 'services/bioassays/index';
import Textarea from 'react-textarea-autosize';
import CsvReader from 'react-csv-reader';
import BioassaySelectItem from './BioassaySelectItem';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const BioAssaysModal = props => {
    const stripLineBreaks = event => {
        event.preventDefault();
        let text = '';
        if (event.clipboardData || event.originalEvent.clipboardData) {
            text = (event.originalEvent || event).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        // strip line breaks
        text = text.replace(/\r?\n|\r/g, ' ');
        setBioassaysTest(bioassaysTest + text);
    };

    const [bioassaysTest, setBioassaysTest] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitAlert, setSubmitAlert] = useState(false);
    const [assayData, setAssayData] = useState([]);

    const handleSubmitText = () => {
        setIsLoadingData(true);
        if (bioassaysTest === '') {
            setSubmitAlert(true);
            setIsLoadingData(false);
        } else {
            setSubmitAlert(false);
            setIsSubmitted(true);
            semantifyBioassays(bioassaysTest)
                .then(result => {
                    console.log(result);
                    setAssayData(result);
                    setIsLoadingData(false);
                })
                .catch(e => {
                    setIsLoadingData(false);
                    toast.error('Error loading data.');
                });
        }
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Semantification of Bioassays</ModalHeader>
            <ModalBody>
                {isLoadingData && (
                    <div className="text-center text-primary">
                        <span style={{ fontSize: 80 }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading...</h2> <br />
                    </div>
                )}
                {!isLoadingData && (
                    <div>
                        <FormGroup>
                            <div className="custom-file">
                                <CsvReader
                                    cssClass="csv-reader-input"
                                    cssInputClass="custom-file-input "
                                    accept=".txt"
                                    onFileLoaded={(data, fileInfo) => setBioassaysTest(data.join('\n'))}
                                    parserOptions={{
                                        skipEmptyLines: true
                                    }}
                                    inputStyle={{ cursor: 'pointer' }}
                                />
                                <label className="custom-file-label" htmlFor="exampleCustomFileBrowser">
                                    Click to upload bioassay .txt file
                                </label>
                            </div>
                            {submitAlert && <Label>Nothing to submit. Please provide text in the input field</Label>}
                            <Label for="bioassaysText">Enter the Bioassays</Label>
                            <Textarea
                                id="bioassaysText"
                                className={`form-control pl-2 pr-2 `}
                                minRows={8}
                                value={bioassaysTest}
                                placeholder="copy a text into this form or use the upload button"
                                onChange={e => setBioassaysTest(e.target.value)}
                                onPaste={stripLineBreaks}
                            />
                        </FormGroup>
                    </div>
                )}
                {isSubmitted && !isLoadingData && (
                    <BioassaySelectItem
                        data={assayData?.labels}
                        id={props.selectedResource}
                        selectionFinished={props.toggle}
                        loadingData={isLoadingData}
                    />
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmitText} disabled={isLoadingData}>
                    Submit
                </Button>
            </ModalFooter>
        </Modal>
    );
};
BioAssaysModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired
};

export default BioAssaysModal;
