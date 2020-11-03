import React, { useState } from 'react';
import { Button, ListGroup } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import moment from 'moment';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faArrowsAltV } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import StatementList from 'components/ConfirmBulkImport/StatementList';

const PaperCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

const PaperList = props => {
    const { papers, existingPaperIds, idToLabel } = props;
    const [showContributions, setShowContributions] = useState([]);

    const handleCardClick = i => {
        if (showContributions.includes(i)) {
            setShowContributions(state => state.filter(j => j !== i));
        } else {
            setShowContributions(state => [...state, i]);
        }
    };

    const handleExpandAll = () => {
        setShowContributions(papers.map((_, i) => i));
    };

    const handleCollapseAll = () => {
        setShowContributions([]);
    };

    return (
        <>
            <div className="w-100 text-right">
                {showContributions.length === 0 ? (
                    <Button size="sm" color="darkblue" className="mb-2" onClick={handleExpandAll}>
                        <Icon icon={faArrowsAltV} /> Expand all data
                    </Button>
                ) : (
                    <Button size="sm" color="darkblue" className="mb-2" onClick={handleCollapseAll}>
                        <Icon icon={faArrowsAltV} /> Collapse all data
                    </Button>
                )}
            </div>

            <ListGroup>
                {papers.map((paper, i) => (
                    <React.Fragment key={i}>
                        <PaperCardStyled
                            className="list-group-item list-group-item-action"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCardClick(i)}
                        >
                            <div className="d-flex">
                                <span className="flex-grow-1">
                                    {existingPaperIds[i] ? (
                                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: existingPaperIds[i] })} target="_blank">
                                            {paper.title}
                                        </Link>
                                    ) : (
                                        paper.title
                                    )}
                                </span>
                                <div className="flex-shrink-1 text-muted pl-3" style={{ fontSize: '140%', opacity: 0.7 }}>
                                    #{i + 1}
                                </div>
                            </div>
                            <small>
                                {paper.authors.length && (
                                    <>
                                        <Icon size="sm" icon={faUser} /> {paper.authors.map(a => a.label).join(' • ')}
                                    </>
                                )}
                                {(paper.publicationMonth || paper.publicationYear) && <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />}
                                {paper.publicationMonth && paper.publicationMonth > 0
                                    ? moment(this.state.optimizedPaperObject.publicationMonth, 'M').format('MMMM')
                                    : ''}{' '}
                                {paper.publicationYear}
                            </small>
                        </PaperCardStyled>
                        {showContributions.includes(i) && (
                            <PaperCardStyled className="list-group-item">
                                <ListGroup className="listGroupEnlarge" style={{ fontSize: '90%' }}>
                                    {Object.keys(paper.contributions[0].values).map(property => (
                                        <StatementList
                                            key={property}
                                            property={property}
                                            idToLabel={idToLabel}
                                            values={paper.contributions[0].values[property]}
                                        />
                                    ))}
                                </ListGroup>
                            </PaperCardStyled>
                        )}
                    </React.Fragment>
                ))}
            </ListGroup>
        </>
    );
};

PaperList.propTypes = {
    papers: PropTypes.array.isRequired,
    existingPaperIds: PropTypes.array.isRequired,
    idToLabel: PropTypes.object.isRequired
};

export default PaperList;
