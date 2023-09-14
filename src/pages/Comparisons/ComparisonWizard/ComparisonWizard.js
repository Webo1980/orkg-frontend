import ROUTES from 'constants/routes.js';
import React, { useState, useEffect } from 'react';
import styled, { withTheme } from 'styled-components';
import { Table, Alert } from 'reactstrap';
import { reverse } from 'named-urls';
import StepContainer from 'components/StepContainer';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faPen, faAdd, faSync } from '@fortawesome/free-solid-svg-icons';
import ConfirmBulkImport from 'components/ConfirmBulkImport/ConfirmBulkImport';
import useComparison from 'components/Comparison/hooks/useComparison';
import Comparison from 'components/Comparison/Comparison';
import useImportBulkData from 'components/ConfirmBulkImport/useImportBulkData';
import ComparisonWizardForm from './ComparisonWizardForm';
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

const TableContainerStyled = styled.div`
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 300px;
    font-size: 90%;
    max-height: 500px;
    border-radius: 6px;
    border: 1px solid #ccc;

    .table {
        margin-bottom: 0;
    }

    .table th, .table td {
        padding: 0.5rem;
        border: 1px solid #ccc;
    }

    .table .type {
        background-color: #e9ebf2;
        font-weight: bold;
    }

    .table .item {
        max-width: 300px;
        white-space: normal;
        overflow: auto;
        word-wrap: break-word;
        position: relative;
    }

    .remove-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        color: gray;
        padding: 0;
    }

    .title {
        background-color: #f2f2f2;
    }

    /* Thin dark gray scrollbar for webkit browsers (Chrome, Safari) */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: darkgray;
        border-radius: 3px;
    }

    /* Thin dark gray scrollbar for Firefox */
    scrollbar-width: thin;
    scrollbar-color: darkgray transparent;
`;
const extractContributionsAndPapersIds = contributions =>
  contributions.map(contribution => ({
    paperId: contribution.paperId,
    contributionId: contribution.id,
}));

const ComparisonWizard = props => {
    const [isOpenAddEntryModal, setIsOpenAddEntryModal] = useState(false);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [addedContributionsMessage, setAddedContributionsMessage] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [dataFolder, setDataFolder] = useState('');
    const [showComparison, setShowComparison] = useState(null);
    const [showComparisonData, setShowComparisonData] = useState(null);
    const [currentContributions, setCurrentContributions] = useState([]);
    const [handleEditComparisonData, setHandleEditComparisonData] = useState([]);
    const [currentFinalContributions, setCurrentFinalContributions] = useState([]);
    const [isContributionsReady, setIsContributionsReady] = useState(false);
    document.title = 'Comparison Wizard - Open Research Knowledge Graph';
    const manageComparison = ManageComparisonWizard();
    const { isBackEndLoading, addComparison, editComparison, addComparisonData, OpenConfirmModal, DraggableResizableDiv } = manageComparison;
    const [dataFromChild, setDataFromChild] = useState({ researchProblems: [], submitted: false });
    const handleDataFromChildChange = newData => {
        setDataFromChild(newData);
    };

    useEffect(() => {
        makePaperList();
    }, [handleEditComparisonData, makePaperList]);

    const {
        createdContributions,
        handleImport,
        makePaperList,
      } = useImportBulkData({
        data: handleEditComparisonData,
        onFinish: () => {
          setIsFinished(true);
        },
        folder: dataFolder,
      });
      useEffect(() => {
        if (handleEditComparisonData !== null) {
          handleImport();
        }
      }, [handleEditComparisonData, handleImport]);
      useEffect(() => {
        if (currentFinalContributions.length > 0) {
          setIsContributionsReady(true); // Set the flag to indicate contributions are ready
        }
      }, [currentFinalContributions]);
      useEffect(() => {
        if (isContributionsReady) {
          const comparisonUrl = `${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?folder=&contributions=${currentFinalContributions.map(
            entry => entry.contributionId,
          )}`;
          window.open(comparisonUrl, '_blank');
        }
      }, [isContributionsReady]);

    useEffect(() => {
        setCurrentFinalContributions(extractContributionsAndPapersIds(currentContributions).concat(createdContributions));
      }, [createdContributions]);

    useEffect(() => {
            setIsOpenConfirmModal(true);
    }, [addComparisonData]);

    const handleShowComparison = index => {
        setShowComparison(index);
    };

    const listResearchProblems = researchProblems => {
        console.log(researchProblems);
        console.log(typeof researchProblems);
        if (researchProblems.hasOwnProperty('error')) {
          return (
            <div>
              <h2 style={{ color: 'red' }} >Something went wrong with the submitted data. Please try another data</h2>
            </div>
          );
        }

        if (Object.keys(researchProblems).length === 0) {
          return (
            <div>
              <h4 style={{ color: 'red' }} >The provided data tackles the below research problems</h4>
              <p>No research problem for the given data. Try again!</p>
            </div>
          );
        }
        return (
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
                <h4 style={{ color: 'red' }}>The submitted data tackle these research problems:</h4>
                {Object.entries(researchProblems).map(([researchProblem, data], index) => {
                  const { directory, comparisons } = data;
                  return (
                    <div key={index}>
                      <div style={{ cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }} onClick={() => handleShowComparison(index)}>
                        <span style={{ flex: 1 }}>{researchProblem}</span>
                        <span><Icon icon={faAdd} style={{ cursor: 'pointer', width: '1.5rem', marginLeft: '0.5rem' }}
                          onClick={() => {
                                    addComparison(researchProblem, directory[0]);
                                    setDataFolder(directory[0]);
                                  }}
                              />
                        </span>
                        <Icon icon={showComparison === index ? faAngleUp : faAngleDown} />
                      </div>
                      {showComparison === index && (
                        <ul>
                          {comparisons.length === 0 ? (
                            <li>
                              No related comparisons. Click the icon to create one using the submitted data.
                              <Icon icon={faAdd} style={{ cursor: 'pointer', width: '1.5rem', marginLeft: '0.5rem' }}
                                onClick={() => {
                                  addComparison(researchProblem, directory[0]);
                                  setDataFolder(directory[0]);
                                }}
                              />
                            </li>
                          ) : (
                            comparisons.map((comparisonUrl, idIndex) => {
                              const showComparisonDataForId = showComparisonData === comparisonUrl;
                              const comparisonId = comparisonUrl.split('/').pop(); // Extract last part of URL
                              const properties = []; // this should get the comparison properties
                              const data = {}; // this should get the comparison data
                              const contributions = []; // this should get the comparison contributions
                              const comparisonType = ''; // this should get the comparison comparisonType
                              const filterControlData = ''; // this should get the comparison filterControlData
                              const updateRulesOfProperty = ''; // this should get the comparison updateRulesOfProperty
                              return (
                                <li key={idIndex}>
                                  <div key={idIndex} style={{ cursor: 'pointer' }}>
                                    <a href={comparisonUrl} target="_blank" rel="noopener noreferrer">
                                      {comparisonId}
                                    </a>
                                    <Icon icon={faPen} style={{ cursor: 'pointer', width: '1.5rem', marginLeft: '0.5rem' }}
                                    onClick={() => {
                                      setHandleEditComparisonData(editComparison(researchProblem, directory[0], properties, comparisonId));
                                      setCurrentContributions(contributions);
                                      setDataFolder(directory[0]);
                                    }}
                                    />
                                    <Icon icon={showComparisonDataForId ? faAngleUp : faAngleDown} onClick={() => setShowComparisonData(showComparisonDataForId ? null : comparisonUrl)} style={{ cursor: 'pointer', width: '1.5rem', marginLeft: '0.5rem' }} />
                                  </div>
                                  {showComparisonDataForId && (
                                    <div>
                                      <Comparison
                                        data={data}
                                        properties={properties}
                                        contributions={contributions}
                                        removeContribution={() => {}}
                                        transpose={false}
                                        viewDensity="compact"
                                        comparisonType={comparisonType}
                                        filterControlData={filterControlData}
                                        updateRulesOfProperty={updateRulesOfProperty}
                                        embeddedMode={true}
                                      />
                                    </div>
                                  )}
                                </li>
                              );
                            })
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
        );
      };
    const ComparisonContainer = () => (
            <>
                    <StepContainer step="1" title="Collecting Data" bottomLine active>
                        <Alert color="info" fade={false}>
                            1. Click on one of the below tabs to add data. <br />
                            2. We will try to find a PDF for your entry unless you provide a PDF explicitly. <br />
                            3. The uploaded PDF files will not be stored on our servers and is only used to extract the data. <br />
                            4. You should at least add 3 entries (PDF, URL, DOI... etc.), in order to start the comparison.
                        </Alert>
                        <TableContainerStyled>
                            <ComparisonWizardForm isOpen={true} setIsOpen={setIsOpenAddEntryModal} onDataChange={handleDataFromChildChange} />
                        </TableContainerStyled>
                    </StepContainer>
                    <StepContainer step="2" title="Fetch Research Problems" topLine bottomLine active={dataFromChild.researchProblems && Object.keys(dataFromChild.researchProblems).length > 0}>
                        {dataFromChild.submitted && listResearchProblems(dataFromChild.researchProblems)}
                    </StepContainer>
                    <StepContainer step="3" title="Create/ Edit a Comparison" topLine active={OpenConfirmModal}>
                        {/* Render the ConfirmBulkImport modal conditionally */}
                        {OpenConfirmModal && (
                            <ConfirmBulkImport
                                data={addComparisonData}
                                isOpen={isOpenConfirmModal}
                                toggle={() => setIsOpenConfirmModal(v => !v)}
                                onFinish={() => setIsFinished(true)}
                                folder={dataFolder}
                            />
                        )}
                    </StepContainer>
            </>
        );

    return <ComparisonContainer />;
};
export default ComparisonWizard;
