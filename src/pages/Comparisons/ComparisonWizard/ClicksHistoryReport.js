import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';

const ClicksHistoryReport = ({ documentsFilePath, showClicksHistoryReportDialog, toggleClicksHistoryReportDialog }) => {
  const [clickHistory, setClickHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const sortedEvents = [...clickHistory].sort((a, b) => a.time.localeCompare(b.time));
  console.log(sortedEvents);
  const hasApprovedAndDisapproved = sortedEvents.some(event => event.approved) && sortedEvents.some(event => !event.approved);
  const timelineContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowX: 'hidden',
    overflowY: 'auto',
    height: '400px',
  };
  const timelineRowStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  };

  const timelineContributionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '40px',
  };

  const timelineCenterLineStyle = {
    width: '2px',
    height: '100%',
    backgroundColor: '#333',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  };

  const timelineEventStyle = {
    width: '160px', // Set a fixed width for the boxes
    position: 'relative',
    padding: '1px',
    borderRadius: '4px',
    margin: '2px',
    fontSize: '12px',
    whiteSpace: 'normal', // Allow text to wrap
    wordWrap: 'break-word', // Break long words into multiple lines
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '70px',
  };

  const timelineEventTimeStyle = {
    maxWidth: '80%', // Limit the width of the time element
  };

  const timelineEventLabelStyle = {
    marginTop: '2px',
  };

  <style>
  {`
    /* Target webkit-based browsers */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    /* Track */
    ::-webkit-scrollbar-track {
      background: #f1f1f1; /* Gray color for track */
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #888; /* Gray color for handle */
      border-radius: 4px;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `}
  </style>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataToSend = {
          folder_name: documentsFilePath,
        };

        const response = await fetch('http://localhost:5003/api/merge-clicks-files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          const data = await response.json();
          setClickHistory(data);
        } else {
          console.error('Request failed with status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false); // Set loading state to false when done (either success or error)
      }
    };

    fetchData();
  }, [showClicksHistoryReportDialog]);

  const ClicksHistory = () => {
    if (isLoading) {
      return <div>Loading...</div>; // Display loading message
    }
    return (
      <div className="timeline-report" style={timelineContainerStyle}>
        <div style={timelineContainerStyle}>
          <div style={timelineRowStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {sortedEvents.map((event, index) => (
                <div key={index} style={timelineContributionStyle}>
                  {!event.approved ? (
                    <div
                      style={{
                        ...timelineEventStyle,
                        backgroundColor: 'lightgreen',
                      }}
                    >
                      <span style={timelineEventLabelStyle}>
                        <span>{event.label}</span>
                      </span>
                      <span style={timelineEventTimeStyle}>{event.time}</span>
                    </div>
                  ) : (
                    <div style={timelineEventStyle} />
                  )}
                </div>
              ))}
            </div>
            {/* Display center line */}
            {hasApprovedAndDisapproved && <div style={timelineCenterLineStyle} />}
            {/* Display disapproved events */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {sortedEvents.map((event, index) => (
                <div key={index} style={timelineContributionStyle}>
                  {event.approved ? (
                    <div
                      style={{
                        ...timelineEventStyle,
                        backgroundColor: 'red',
                      }}
                    >
                      <span style={timelineEventLabelStyle}>
                        <span>{event.label}</span>
                      </span>
                      <span>{event.time}</span>
                    </div>
                  ) : (
                    <div style={timelineEventStyle} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
 return (
    <>
        <Modal isOpen={showClicksHistoryReportDialog} toggle={toggleClicksHistoryReportDialog} size="lg">
            <ModalHeader toggle={toggleClicksHistoryReportDialog}>Clicks History</ModalHeader>
                <ModalBody>
                    <ClicksHistory />
                </ModalBody>
        </Modal>
    </>
  );
};
ClicksHistoryReport.propTypes = {
  documentsFilePath: PropTypes.string.isRequired,
  showClicksHistoryReportDialog: PropTypes.bool.isRequired,
  toggleClicksHistoryReportDialog: PropTypes.bool.isRequired,
};

export default ClicksHistoryReport;
