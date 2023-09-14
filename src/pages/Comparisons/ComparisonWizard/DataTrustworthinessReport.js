import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody, Alert, Card, CardBody } from 'reactstrap';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import optional styles for annotations
import 'pdfjs-dist/build/pdf.worker.entry';
import { property } from 'lodash';

const DataTrustworthinessReport = ({ documentsFilePath, showDataTrustworthinessReportDialog, toggleDataTrustworthinessReportDialog }) => {
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [highlightedText, setHighlightedText] = useState(null);
  const [properties, setProperties] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [textZoom, setTextZoom] = useState(100);
  const [jsonData, setJsonData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

  // Define the options for PDF rendering
  const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  };

  useEffect(() => {
    fetch(documentsFilePath)
      .then(response => response.json())
      .then(data => {
        setJsonData(data);
        console.log(data);
        setSelectedPaper(null);
        setSelectedProperty(null);
        const chatResponses = data.file_responses.map(paper => JSON.parse(paper.chat_response));
        const paperProperties = chatResponses.map(chatResponse =>
          Object.keys(chatResponse)
            .filter(key => key !== 'paper_title')
            .map(propertyKey => {
              const propertyValue = chatResponse[propertyKey]; // Get the property value
              return propertyValue; // Return the property value
            }),
        );
        setProperties(paperProperties);
        // Update pdfTextContent when the data is fetched
        onDocumentLoadSuccess({ numPages: chatResponses.length });
        // Update the PDF URL based on the fetched data
        if (data.file_responses.length > 0) {
          setPdfUrl(`/api/files/${data.file_responses[0].pdf_file}`);
        }
      })
      .catch(error => console.error('Error loading JSON data:', error));
  }, [documentsFilePath]);
  const highlightProperty = (text, propertyValue) => {
    const parts = text.split(propertyValue);
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="highlight">{propertyValue}</span>}
        {part}
      </React.Fragment>
    ));
  };
  const handlePaperClick = paperIndex => {
    setSelectedPaper(paperIndex);
    setSelectedProperty(null);
    const paper = jsonData.file_responses[paperIndex];
    setPdfUrl(`/api/files/${paper.pdf_file}`);
  };
  const handlePropertyClick = propertyIndex => {
    setSelectedProperty(propertyIndex);
    const selectedProperty = properties[selectedPaper][propertyIndex];
    if (selectedProperty && selectedProperty.value) {
      console.log(selectedProperty.value);
      setHighlightedText(selectedProperty.value);
      scrollToHighlightedText(selectedProperty.value);
      // Logic to find and set the page number that contains the text
      // You need to implement this part
    }
  };
  const scrollToHighlightedText = text => {
    const textContent = document.querySelector('.pdf-container'); // Replace with the appropriate selector
    const textElements = textContent.querySelectorAll('span');
    textElements.forEach(textElement => {
      if (textElement.textContent.includes(text)) {
        const topOffset = textElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
        // Apply the highlighting effect to all occurrences
        textElement.style.backgroundColor = 'yellow'; // Replace with your highlight color
        // Log the textZoom value just before applying the text zoom
        console.log(textZoom); // Check the updated textZoom value here
        // Apply the text zoom
        textElement.style.fontSize = `${textZoom}%`;
      }
    });
  };

  const handlePrevPage = () => {
    if (selectedPaper !== null) {
      const prevPage = selectedPage - 1;
      if (prevPage >= 0) {
        setSelectedPage(prevPage);
      }
    }
  };
  const handleNextPage = () => {
    if (selectedPaper !== null) {
      const nextPage = selectedPage + 1;
      if (nextPage < properties[selectedPaper].length) {
        setSelectedPage(nextPage);
      }
    }
  };
  const handlePageLoadSuccess = async (page, pageNumber) => {
    if (highlightedText) {
      const textContent = await page.getTextContent();
      const textLayer = document.querySelector(`.react-pdf__Page__textContent.page-${pageNumber}`);
      if (textLayer) {
        const matches = findMatches(textContent.items, highlightedText);
        if (matches.length > 0) {
          const targetElement = textLayer.querySelector(`span[data-index="${matches[0].itemIndex}"]`);
          if (targetElement) {
            const topOffset = targetElement.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: topOffset, behavior: 'smooth' });
            // Apply the colored background highlight
            targetElement.style.backgroundColor = 'yellow'; // Change to your desired highlight color
          }
        }
      }
    }
  };
  const findMatches = (textItems, searchText) => {
    const matches = [];
    for (const item of textItems) {
      const text = item.str;
      const startIndex = text.indexOf(searchText);
      if (startIndex !== -1) {
        matches.push({ itemIndex: item.transform[5], startIndex });
      }
    }
    return matches;
  };
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages); // Set the numPages state here
  };

  if (!jsonData) {
    return null; // Return a loading indicator or error message
  }
  const TrustworthinessReport = () => (
      <div className="data-trustworthiness-container">
        <div className="paper-list">
          {jsonData.file_responses.map((paper, index) => {
            const chatResponse = JSON.parse(paper.chat_response);

            const properties = Object.keys(chatResponse)
            .filter(key => key !== 'paper_title')
            .map(property => {
              if (typeof chatResponse[property] === 'string') {
                try {
                  const propertyValue = JSON.parse(chatResponse[property]);
                  if (typeof propertyValue === 'object' && propertyValue.value !== undefined) {
                    return propertyValue;
                  }
                    // Add a default return statement for this branch
                    return chatResponse[property];
                } catch (error) {
                  // Add a default return statement for this branch
                  return chatResponse[property];
                }
              } else {
                // Add a default return statement for this branch
                return chatResponse[property];
              }
            });
            return (
              <div key={index} className="paper-wrapper">
                {chatResponse.paper_title && (
                  <Alert
                    color="success"
                    className={`py-2 mb-2 d-flex justify-content-between align-items-center paper-title ${selectedPaper === index ? 'active' : ''}`}
                    onClick={() => handlePaperClick(index)}
                  >
                    <span>
                      <Icon icon={selectedPaper === index ? faCaretDown : faCaretRight} />
                      <span style={{ margin: '5px' }}>{ chatResponse.paper_title.value }</span>
                    </span>
                  </Alert>
                )}
                {selectedPaper === index && (
                  <div className="property-list">
                    {properties.map((property, propertyIndex) => (
                      <div
                        key={propertyIndex}
                        className={`property ${selectedProperty === propertyIndex ? 'active' : ''}`}
                        onClick={() => handlePropertyClick(propertyIndex)}
                      >
                        <div className="property-wrapper">
                          <div className="property-title">
                            {typeof property === 'object' ? (
                              <div>
                                {property.value}
                              </div>
                            ) : (
                              property
                            )}
                          </div>
                          <div className="property-icon">
                            <Icon icon={faCaretDown} />
                          </div>
                        </div>
                        {selectedProperty === propertyIndex && (
                          <div className="property-sentences">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold' }}>Section: {property.Section}</span>
                            </div>
                            <div className="sentence-section">
                              {typeof property === 'object' && property.Score && (
                                <div className="sentence">
                                  {highlightProperty(property.Sentence, property.value)}
                                </div>
                              )}
                              {typeof property === 'object' && property['Sentence before'] && (
                                <div className="sentence">
                                  {highlightProperty(property['Sentence before'], property.value)}
                                </div>
                              )}
                              {typeof property === 'object' && property['Sentence after'] && (
                                <div className="sentence">
                                  {highlightProperty(property['Sentence after'], property.value)}
                                </div>
                              )}
                            </div>
                            {typeof property === 'object' && property.Score && (
                              <div className="heatmap-score">
                                Confidence Score: {property.Score}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="pdf-viewer">
          {/* Zoom buttons */}
          <div className="zoom-buttons">
            <button onClick={() => setTextZoom(prevZoom => Math.min(prevZoom + 10, 200))}>
              <Icon icon={faSearchPlus} />
            </button>
            <button onClick={() => setTextZoom(prevZoom => Math.max(prevZoom - 10, 50))}>
              <Icon icon={faSearchMinus} />
            </button>
          </div>
        {selectedPaper !== null ? (
        <div className="pdf-container">
          {pdfUrl && numPages > 0 && ( // Check numPages before rendering the Document component
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
            loading="Loading PDF..."
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                onLoadSuccess={page => handlePageLoadSuccess(page, index + 1)}
              />
            ))}
          </Document>
          )}
          <div className="pdf-navigation">
            <button onClick={handlePrevPage} disabled={selectedPage === 0}>
              Previous Page
            </button>
            <button
              onClick={handleNextPage}
              disabled={selectedPage === numPages - 1} // Check against numPages
            >
              Next Page
            </button>
            <span style={{ padding: '3px' }}>Page Number: { selectedPage + 1 }</span>
          </div>
        </div>
        ) : (
          // Content to render when selectedPaper is null
          <div style={{ margin: '20px', color: 'rgb(13 125 11)', fontWeight: '600' }}>
            Click on a paper title on the left pan to load the corresponding pdf
          </div>
        )}
        </div>
        <style>
          {`
            .data-trustworthiness-container {
              display: flex;
              gap: 16px;
            }
            
            .paper-list {
              flex: 1;
            }
            
            .paper-wrapper {
              border-left: 1px solid #ddd;
              border-right: 1px solid #ddd;
              margin-bottom: 16px;
              --bs-border-radius: aliceblue;
            }
            
            .paper-title {
              /* Your paper title styles here */
              border: none;
              border-bottom: 1px solid #ddd;
              padding: 8px;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            
            .paper-title.active {
              background-color: #f5f5f5;
            }
            
            .property-list {
              /* Your property list styles here */
            }
            
            .property {
              /* Your property styles here */
              border: 1px solid #ddd;
              border-top: none;
              padding: 8px;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            
            .property.active {
              background-color: #f5f5f5;
            }
            
            .property-wrapper {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .property-title {
              /* Your property title styles here */
            }
            
            .property-value {
              color: #007bff;
            }
            
            .property-icon {
              /* Your property icon styles here */
              transition: transform 0.3s;
            }
            
            .property.active .property-icon {
              transform: rotate(180deg);
            }
            
            .property-sentences {
              /* Your property sentences styles here */
              border: 1px solid #ddd;
              margin-top: 8px;
              padding: 8px;
              display: none;
            }
            
            .property.active .property-sentences {
              display: block;
            }
            
            .property-sentence {
              /* Your sentence styles here */
              margin-bottom: 4px;
            }
            
            .property-sentence .highlight {
              background-color: yellow;
            }
            
            .pdf-viewer {
              flex: 1;
            }

            .highlight {
              background-color: yellow; /* Highlight color */
            }

            .heatmap-score {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              background: linear-gradient(to right, green 0%, yellow 50%, red 100%);
              color: white;
            }
        
          `}
        </style>
      </div>
    );
  return (
    <>
        <Modal isOpen={showDataTrustworthinessReportDialog} toggle={toggleDataTrustworthinessReportDialog} size="lg">
            <ModalHeader toggle={toggleDataTrustworthinessReportDialog}>Data Trustworthiness Report</ModalHeader>
                <ModalBody>
                    <TrustworthinessReport />
                </ModalBody>
        </Modal>
    </>
  );
};

DataTrustworthinessReport.propTypes = {
  documentsFilePath: PropTypes.string,
  showDataTrustworthinessReportDialog: PropTypes.bool,
  toggleDataTrustworthinessReportDialog: property.bool,
};
export default DataTrustworthinessReport;
