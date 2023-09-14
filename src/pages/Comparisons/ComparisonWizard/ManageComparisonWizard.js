import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { toast } from 'react-toastify';
import 'react-resizable/css/styles.css'; // Import the styles
import { property } from 'lodash';

const ManageComparisonWizard = () => {
  const [researchProblems, setResearchProblems] = useState({});
  const [titlePDFURL, setTitlePDFURL] = useState([]);
  const [doiData, setDoiData] = useState([]);
  const [abstractData, setAbstractData] = useState([]);
  const [pdfDownloadable, setPdfDownloadable] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [handleAddComparisonData, setHandleAddComparisonData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [submitted, setSubmitted] = useState(false); // Track form submission
  const [isBackEndLoading, setIsBackEndLoading] = useState(false);

  const getResearchProblem = async (formData, url) => {
    console.log(formData);
    setSubmitted(true);
    setIsBackEndLoading(true);
    try {
        const response = await axios.post(url, formData);
        if (response.status === 200) {
            console.log(response.data);
            console.log('Data sent successfully:', response.data);
            setResearchProblems(response.data);
            console.log(response.data);
            setIsBackEndLoading(false);
            return response.data; // Return the response data
        }
            console.error('Error sending data:', response.data);
            setIsBackEndLoading(false);
            toast.error('Failed to fetch research problems');
            throw new Error('Failed to fetch research problems');
    } catch (error) {
        toast.error('An error occurred while sending data:', error);
        setIsBackEndLoading(false);
        throw error;
    }
  };

  const getPDFByTitle = async (title, url) => {
    const titleObject = {
      title,
    };
    setIsBackEndLoading(true);
    try {
      const response = await axios.post(url, titleObject);

      if (response.status === 200) {
        console.log('Data sent successfully:', response.data);
        console.log(Object.keys(response.data).length);
        console.log(response.data);
        setTitlePDFURL(response.data);
        setIsBackEndLoading(false);
      } else {
        console.error('Error sending data:', response.data);
        setIsBackEndLoading(false);
      }
    } catch (error) {
      toast.error('An error occurred while sending title data:', error);
      setIsBackEndLoading(false);
    }
  };

  const getDataByDoi = async (DOI, url) => {
    const DOIObject = {
      doi: DOI,
    };
    setIsBackEndLoading(true);
    try {
      const response = await axios.post(url, DOIObject);

      if (response.status === 200) {
        console.log('Data sent successfully:', response.data);
        console.log(Object.keys(response.data).length);
        setDoiData(response.data);
        setIsBackEndLoading(false);
      } else {
        console.error('Error sending data:', response.data);
        setIsBackEndLoading(false);
      }
    } catch (error) {
      toast.error('An error occurred while sending data:', error);
      setIsBackEndLoading(false);
    }
  };

  const getDataByAbstract = async (abstract, url) => {
    const abstractObject = {
      abstract,
    };
    setIsBackEndLoading(true);
    try {
      const response = await axios.post(url, abstractObject);

      if (response.status === 200) {
        console.log('Data sent successfully:', response.data);
        console.log(Object.keys(response.data).length);
        setAbstractData(response.data);
        setIsBackEndLoading(false);
      } else {
        console.error('Error sending data:', response.data);
        setIsBackEndLoading(false);
      }
    } catch (error) {
      toast.error('An error occurred while sending data:', error);
      setIsBackEndLoading(false);
    }
  };

  const checkPDFURL = async (pdfURL, url) => {
    setIsBackEndLoading(true);
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, pdfURL, { headers });

      if (response.status === 200) {
        console.log('Data sent successfully:', response.data);
        console.log(Object.keys(response.data));
        setPdfDownloadable(response.data);
        setIsBackEndLoading(false);
      } else {
        console.error('Error sending data:', response.data);
        setIsBackEndLoading(false);
      }
    } catch (error) {
      toast.error('An error occurred while sending the pdf url:', error);
      setIsBackEndLoading(false);
    }
  };

  const extractProperties = data => data.map(item => {
        const label = item.label.replace(/ /g, '_');
        return label;
    });

  // this function to map the properties, as chat PDF sometimes causes problems when the property name has spaces
  const extractOriginalProperties = data =>
    data.reduce((result, item) => {
      const originalLabel = item.label;
      const editedLabel = originalLabel.replace(/ /g, '_');
      result[editedLabel] = originalLabel;
      return result;
  }, {});

  const handleEditComparison = async (researchProblem, lastDirectory, properties, comparisonId) => {
    setIsBackEndLoading(true);
    // const contributionsAndPapersIds = extractContributionsAndPapersIds(contributions);
    const propertiesNames = extractProperties(properties);
    const originalPropertiesNames = extractOriginalProperties(properties);
    const dataToSend = {
      researchProblem,
      lastDirectory,
      propertiesNames,
      originalPropertiesNames,
      comparisonId,
    };

    try {
      const response = await axios.post('http://localhost:5003/api/edit-comparison', dataToSend);

      if (response) {
        setIsBackEndLoading(false);
        console.log('Response from sendDataToBackend:', response);
        return (response.data);
      }
    } catch (error) {
      toast.error('An error occurred while editing the comparison:', error);
      setIsBackEndLoading(false);
    }
  };

  const handleAddComparison = async (researchProblem, lastDirectory) => {
    setIsBackEndLoading(true);
    const dataToSend = {
                          researchProblem,
                          lastDirectory,
                       };
    try {
      const response = await axios.post('http://localhost:5003/api/add-comparison', dataToSend);
      // Capture and use the response data
      if (response) {
        console.log('Response from sendDataToBackend:', response);
        setHandleAddComparisonData(response.data);
        setIsOpenConfirmModal(true);
        setIsBackEndLoading(false);
      }
    } catch (error) {
      toast.error('An error occurred while adding the comparison:', error);
      setIsBackEndLoading(false);
    }
  };
  const DraggableResizableDiv = ({ children, initialWidth, initialHeight, left, top, headText, customText, tapTopPosistion, tapLeftPosition }) => {
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
    const [isCollapsed, setIsCollapsed] = useState(true);
    const handleToggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };
    const handleResize = (e, { size }) => {
      setSize(size);
    };
    DraggableResizableDiv.propTypes = {
      children: PropTypes.string,
      initialHeight: PropTypes.string,
      left: PropTypes.string,
      top: PropTypes.string,
      headText: PropTypes.string,
      customText: PropTypes.string,
      tapTopPosistion: PropTypes.string,
      tapLeftPosition: PropTypes.string,
      initialWidth: PropTypes.string,
    };
    return (
      <>
        {!isCollapsed && (
          <Draggable>
            <Resizable
              width={size.width}
              height={size.height}
              minConstraints={[80, 80]}
              onResize={handleResize}
              resizeHandles={['se']}
            >
              <div
                style={{
                  position: 'absolute',
                  top,
                  left,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#ffffff',
                  boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e6e6e6',
                  borderRadius: '8px',
                  overflow: 'auto',
                  zIndex: 1000,
                  width: size.width,
                  height: size.height,
                }}
                className={`draggable-resizable-div ${isCollapsed ? 'collapsed' : ''}`}
              >
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: '#e6e6e6',
                    cursor: 'move',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                  className="handle"
                />
                <div style={{ padding: '10px' }} className="content">
                  <div style={{ textAlign: 'center', color: 'red', fontWeight: 'bold' }}>{headText}</div>
                  {children}
                  <button
                    className="collapse-button"
                    onClick={handleToggleCollapse}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '14px',
                      background: 'rgb(128, 134, 155)',
                    }}
                  >
                    <Icon icon={faAngleDoubleLeft} />
                  </button>
                </div>
              </div>
            </Resizable>
          </Draggable>
        )}
        <div>
          {isCollapsed && (
            <button
              className="collapse-button custom-collapse-button"
              onClick={handleToggleCollapse}
              style={{
                position: 'fixed',
                top: '40%',
                left: '91%',
                transform: 'translateY(-50%)',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                fontSize: '14px',
                background: 'rgb(128, 134, 155)',
                borderRadius: '6px',
              }}
            >
              <Icon icon={faAngleDoubleRight} style={{ padding: '2px' }} /> Data Box
              {customText}
            </button>
          )}
        </div>
      </>
    );
  };
  return {
    sendComparisonDataToBackend: getResearchProblem,
    addComparison: handleAddComparison,
    editComparison: handleEditComparison,
    submitted,
    sendTitlePDFURL: getPDFByTitle,
    titlePDFURL,
    sendDoiData: getDataByDoi,
    doiData,
    sendAbstractData: getDataByAbstract,
    abstractData,
    sendPDFURL: checkPDFURL,
    pdfDownloadable,
    isBackEndLoading,
    researchProblems,
    addComparisonData: handleAddComparisonData,
    OpenConfirmModal: isOpenConfirmModal,
    DraggableResizableDiv,
  };
};
export default ManageComparisonWizard;
