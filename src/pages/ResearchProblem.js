import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Badge, ListGroup, ListGroupItem, Card, CardBody, CardFooter } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import ResearchProblemHeaderBar from 'components/ResearchProblem/ResearchProblemHeaderBar';
import useResearchProblem from 'components/ResearchProblem/hooks/useResearchProblem';
import useResearchProblemPapers from 'components/ResearchProblem/hooks/useResearchProblemPapers';
import useResearchProblemComparisons from 'components/ResearchProblem/hooks/useResearchProblemComparisons';
import useResearchProblemResearchFields from 'components/ResearchProblem/hooks/useResearchProblemResearchFields';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
//import LeaderBoard from 'components/ResearchProblem/LeaderBoard';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import ROUTES from 'constants/routes';

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function ResearchProblem(props) {
    const [researchProblemData, parentResearchProblems, isLoading, isFailedLoading, loadResearchProblemData] = useResearchProblem();
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    const [papers, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useResearchProblemPapers();
    const [
        comparisons,
        isLoadingComparisons,
        hasNextPageComparisons,
        isLastPageReachedComparisons,
        loadMoreComparisons
    ] = useResearchProblemComparisons();
    const [researchFields, isLoadingResearchFields] = useResearchProblemResearchFields();
    const { researchProblemId } = props.match.params;

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResearchProblemData(researchProblemId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

    return (
        <div>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-4 mb-4">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && (
                <div>
                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            resourceId={researchProblemId}
                            resourceLabel={researchProblemData.label}
                            enableEdit={true}
                            syncBackend={true}
                        />
                    )}
                    <ResearchProblemHeaderBar toggleEdit={() => setEditMode(v => !v)} title={researchProblemData.label} id={researchProblemId} />
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <h3 className="mt-4 mb-4">{researchProblemData && researchProblemData.label}</h3>
                                {researchProblemData.description && <div className="mb-4">{researchProblemData.description}</div>}
                                {researchProblemData.sameAs && (
                                    <ExternalDescription
                                        query={researchProblemData.sameAs ? researchProblemData.sameAs.label : researchProblemData.label}
                                    />
                                )}
                            </CardBody>

                            {parentResearchProblems.length > 0 && (
                                <CardFooter>
                                    {parentResearchProblems.map((field, index) => (
                                        <span key={field.id}>
                                            {index !== parentResearchProblems.length - 1 ? (
                                                <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: field.id })}>{field.label}</Link>
                                            ) : (
                                                field.label
                                            )}
                                            {index !== parentResearchProblems.length - 1 && <Icon className="ml-2 mr-2" icon={faAngleDoubleRight} />}
                                        </span>
                                    ))}
                                </CardFooter>
                            )}
                        </Card>

                        <Row className="mt-3">
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Sub-problems</h5>
                                    {researchProblemData.subProblems && researchProblemData.subProblems.length > 0 && (
                                        <>
                                            {researchProblemData.subProblems.map(subP => (
                                                <div key={`subrp${subP.id}`}>
                                                    <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: subP.id })}>{subP.label}</Link>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    {researchProblemData.subProblems && researchProblemData.subProblems.length === 0 && (
                                        <>No sub research problems.</>
                                    )}
                                </div>
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Research fields</h5>
                                    <div>
                                        <small className="text-muted">
                                            Research fields of <i>papers</i> that are addressing this problem
                                        </small>
                                    </div>
                                    {!isLoadingResearchFields ? (
                                        <div className="mb-4 mt-4">
                                            {researchFields.length > 0 ? (
                                                <ul className="pl-1">
                                                    {researchFields.map(researchField => {
                                                        return (
                                                            <li key={`rf${researchField.field.id}`}>
                                                                <Link
                                                                    to={reverse(ROUTES.RESEARCH_FIELD, {
                                                                        researchFieldId: researchField.field.id
                                                                    })}
                                                                >
                                                                    {researchField.field.label}
                                                                    <small>
                                                                        <Badge className="ml-1" color="info" pill>
                                                                            {researchField.freq}
                                                                        </Badge>
                                                                    </small>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="text-center mt-4 mb-4">No research fields</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center mt-4 mb-4">Loading research fields ...</div>
                                    )}
                                </div>
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Super-problems</h5>
                                    {researchProblemData.superProblems && researchProblemData.superProblems.length > 0 && (
                                        <>
                                            {researchProblemData.superProblems.map(supP => (
                                                <div key={`suprp${supP.id}`}>
                                                    <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: supP.id })}>{supP.label}</Link>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    {researchProblemData.superProblems && researchProblemData.superProblems.length === 0 && (
                                        <>No super research problems.</>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        {/* 
                        <Row className="mt-3">
                            <Col md="4" className="d-flex">
                                <LeaderBoard />
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Managed by</h5>
                                    Coming soon
                                </div>
                            </Col>
                        </Row>
                        */}
                    </Container>

                    <Container className="p-0">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Comparisons</h1>
                    </Container>
                    <Container className="p-0">
                        {comparisons.length > 0 && (
                            <div>
                                {comparisons.map(comparison => {
                                    return comparison && <ComparisonCard comparison={{ ...comparison }} key={`pc${comparison.id}`} />;
                                })}
                            </div>
                        )}
                        {comparisons.length === 0 && !isLoadingComparisons && (
                            <div className="box rounded-lg p-5 text-center mt-4 mb-4">
                                There are no published comparisons for this research problem, yet.
                                <br />
                            </div>
                        )}
                        {isLoadingComparisons && (
                            <div className="text-center mt-4 mb-4">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {!isLoadingComparisons && hasNextPageComparisons && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center mt-2"
                                onClick={!isLoadingComparisons ? loadMoreComparisons : undefined}
                            >
                                Load more comparisons
                            </div>
                        )}
                        {!hasNextPageComparisons && isLastPageReachedComparisons && (
                            <div className="text-center mt-3">You have reached the last page.</div>
                        )}
                    </Container>

                    <Container>
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Papers</h1>
                    </Container>
                    <Container className="p-0">
                        <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                            {papers.length > 0 && (
                                <div>
                                    {papers.map(paper => {
                                        return (
                                            paper && (
                                                <PaperCard
                                                    paper={{
                                                        id: paper.id,
                                                        title: paper.label,
                                                        ...paper.data
                                                    }}
                                                    contribution={{ id: paper.contribution.id, title: paper.contribution.label }}
                                                    key={`pc${paper.contribution.id}`}
                                                />
                                            )
                                        );
                                    })}
                                </div>
                            )}
                            {papers.length === 0 && !isLoadingPapers && (
                                <div className="text-center mt-4 mb-4">
                                    There are no papers for this research problem, yet.
                                    <br />
                                    <br />
                                    <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                        <Button size="sm" color="primary " className="mr-3">
                                            Add paper
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {isLoadingPapers && (
                                <ListGroupItem tag="div" className="text-center">
                                    <Icon icon={faSpinner} spin /> Loading
                                </ListGroupItem>
                            )}
                            {!isLoadingPapers && hasNextPage && !isLastPageReached && (
                                <ListGroupItem
                                    style={{ cursor: 'pointer' }}
                                    className="text-center"
                                    action
                                    onClick={!isLoadingPapers ? loadMorePapers : undefined}
                                >
                                    <Icon icon={faAngleDoubleDown} /> Load more papers
                                </ListGroupItem>
                            )}
                            {!hasNextPage && isLastPageReached && (
                                <ListGroupItem tag="div" className="text-center">
                                    You have reached the last page.
                                </ListGroupItem>
                            )}
                        </ListGroup>
                        <ComparisonPopup />
                    </Container>
                </div>
            )}
        </div>
    );
}

ResearchProblem.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchProblemId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchProblem;
