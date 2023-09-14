import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faCheck, faTimes, faQuestionCircle, faScaleBalanced } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { setIsHelpModalOpen } from 'slices/statementBrowserSlice';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, memo, useEffect } from 'react';
import classNames from 'classnames';
import env from '@beam-australia/react-env';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { ColorSpace } from 'pdfjs-dist/build/pdf.worker';

const ButtonsContainer = styled.div`
    position: absolute;
    right: 0;
    top: -10px;
    padding: 6px;
    border-radius: 6px;
    display: none;

    &.disableHover.cell-buttons {
        display: block;
    }
`;

const TableCellButtons = ({ handleApprovalClicks, approveStatus, approveStatusText, value, onEdit, onDelete, backgroundColor, style }) => {
    const [disableHover, setDisableHover] = useState(false);
    const [jsonData, setJsonData] = useState({});
    const [title, setTitle] = useState('');
    const dispatch = useDispatch();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const folderName = searchParams.get('folder');
    console.log(folderName);
    const fileName = `/api/jsons/${folderName}.json`;
    console.log(fileName);
    const buttonClasses = classNames({
        'cell-buttons': true,
        disableHover,
    });

    useEffect(() => {
        fetch(fileName)
          .then(response => response.json())
          .then(data => {
            setJsonData(data);
            console.log(data);
          })
          .catch(error => console.error('Error loading JSON data:', error));
    }, [fileName]);
    const getTippy = (data, propertyValue) => {
        const matchingResponses = data.file_responses.filter(response => {
            const chatResponse = JSON.parse(response.chat_response);
            const foundProperties = Object.values(chatResponse).filter(property =>
                property.value.toLowerCase().trim() === propertyValue.toLowerCase().trim(),
            );
            return foundProperties.length > 0;
        });
        return matchingResponses.map((response, index) => {
            const chatResponse = JSON.parse(response.chat_response);
            const matchedProperty = Object.values(chatResponse).find(property =>
                property.value.toLowerCase().trim() === propertyValue.toLowerCase().trim(),
            );
            const { Section, Sentence, Score } = matchedProperty;
            const pdfFile = response.pdf_file;
            const parts = Sentence.split(new RegExp(`(${propertyValue})`, 'gi'));
            return (
                <div key={index}>
                    <div><strong>{`Section: ${Section}`}</strong></div>
                    <div style={{ borderBottom: '1px solid black' }}>
                        {parts.map((part, partIndex) => {
                            if (part.toLowerCase() === propertyValue.toLowerCase()) {
                                return (
                                    <span key={partIndex} style={{ color: 'yellow' }}>
                                        {part}
                                    </span>
                                );
                            }
                            return <span key={partIndex}>{part}</span>;
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: 'green' }}>{`Confidence Score: ${Score}`}</div>
                        <a href={pdfFile} target="_blank" rel="noopener noreferrer">PDF Link</a>
                    </div>
                </div>
            );
        });
    };
    return (
        <ButtonsContainer style={{ backgroundColor, ...style }} className={buttonClasses}>
            <StatementActionButton
                appendTo={document.body}
                title={approveStatusText || ''}
                icon={!approveStatus ? faCheck : faTimes}
                isDisabled={env('PWC_USER_ID') === value?.created_by}
                action={() => {
                    handleApprovalClicks();
                }}
                // action={handleCellClick}
            />
            <Tippy content="Report" trigger="mouseenter" interactive={true} hideOnClick={false}>
                <StatementActionButton
                    appendTo={document.body}
                    title={Object.keys(jsonData).length > 0 ? getTippy(jsonData, value?.label || '') : 'Loading...'}
                    icon={faScaleBalanced}
                />
            </Tippy>
            {onEdit && (value?.shared ?? 0) > 1 && (
                <StatementActionButton
                    isDisabled={true}
                    interactive={true}
                    appendTo={document.body}
                    title={
                        <>
                            A shared resource cannot be edited directly{' '}
                            <Button
                                color="link"
                                className="p-0"
                                onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.RESOURCE_SHARED }))}
                            >
                                <Icon icon={faQuestionCircle} />
                            </Button>
                        </>
                    }
                    icon={faPen}
                    action={() => null}
                />
            )}
            {onEdit && (value?.shared ?? 0) <= 1 && (
                <StatementActionButton
                    appendTo={document.body}
                    title="Edit"
                    icon={faPen}
                    action={onEdit}
                    isDisabled={env('PWC_USER_ID') === value?.created_by}
                />
            )}

            <StatementActionButton
                title={onDelete ? 'Delete' : 'This item cannot be deleted'}
                icon={faTrash}
                appendTo={document.body}
                isDisabled={!onDelete}
                requireConfirmation={true}
                confirmationMessage="Are you sure to delete?"
                confirmationButtons={[
                    {
                        title: 'Delete',
                        color: 'danger',
                        icon: faCheck,
                        action: onDelete,
                    },
                    {
                        title: 'Cancel',
                        color: 'secondary',
                        icon: faTimes,
                    },
                ]}
                onVisibilityChange={disable => setDisableHover(disable)}
            />
        </ButtonsContainer>
    );
};

TableCellButtons.propTypes = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    backgroundColor: PropTypes.string.isRequired,
    style: PropTypes.object,
    value: PropTypes.object,
    clickHistory: PropTypes.array,
    handleApprovalClicks: PropTypes.func,
    approveStatus: PropTypes.bool,
    approveStatusText: PropTypes.string,
 };

TableCellButtons.defaultProps = {
    style: {},
    onEdit: null,
    onDelete: null,
};

export default memo(TableCellButtons);
