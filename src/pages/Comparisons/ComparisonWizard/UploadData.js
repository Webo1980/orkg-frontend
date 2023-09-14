import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DragData from './DragData';

const styles = {
    uploadedFilesContainer: {
        marginTop: '20px', // Adjust the space below the file upload box
        overflowY: 'auto', // Enable vertical scrolling
        maxHeight: '130px', // Prevent the container from expanding vertically

        /* Thin dark gray scrollbar for webkit browsers (Chrome, Safari) */
        scrollbarWidth: 'thin',
        scrollbarColor: 'darkgray transparent',

        /* Thin dark gray scrollbar for Firefox */
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'darkgray',
            borderRadius: '3px',
        },
    },
    scrollContainer: {
        display: 'flex', // Use flex to keep the content in a row
    },
    fileTable: {
        display: 'flex',
        flexDirection: 'column',
        borderCollapse: 'collapse',
    },
    fileRow: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #ddd',
        padding: '8px 0',
    },
    fileRowHeader: {
        fontWeight: 'bold',
    },
    fileCell: {
        flexBasis: '33.33%',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
    },
    columnContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
    },
    // Add more styles as needed
};

const UploadData = ({ onDataUpload }) => {
    const { pdfName } = useSelector(state => state.addPaper);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    // const [grobidTitles, setGrobidTitles] = useState({});
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    // const dispatch = useDispatch();

    const handleOnDrop = async files => {
        try {
            const newUploadedFiles = {};

            files.forEach(file => {
                // Use a unique identifier (e.g., file name) as the key
                newUploadedFiles[file.name] = file;
            });
            onDataUpload(newUploadedFiles);
            setIsFileUploaded(Object.keys(newUploadedFiles).length > 0);
            setUploadedFiles(newUploadedFiles);
            const reader = new FileReader();
            toast.success('PDF was added successfully to the data box');
            reader.readAsBinaryString(files[0]);
            console.log(reader.readAsBinaryString(files[0]));
        } catch (e) {
            console.log('Something went wrong while parsing the PDF', e);
        }
    };
    return (
        <div id="pdfUploader">
            <div className="justify-content-center">
                <DragData onDrop={handleOnDrop} isFileUploaded={isFileUploaded} />
            </div>
        </div>
    );
};

UploadData.propTypes = {
    onDataUpload: PropTypes.func.isRequired, // Define the expected PropTypes for onDataUpload
};

export default UploadData;
