import { useState, useEffect } from 'react';
import { Container, ListGroup, ListGroupItem, ButtonGroup } from 'reactstrap';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getClasses } from 'services/backend/classes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';

const Classes = () => {
    const pageSize = 25;
    const [classes, setClasses] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        document.title = 'Classes - ORKG';
        loadMoreClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMoreClasses = () => {
        setIsNextPageLoading(true);
        getClasses({
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        })
            .then(result => {
                setClasses(prevClasses => [...prevClasses, ...result.content]);
                setIsNextPageLoading(false);
                setHasNextPage(!result.last);
                setIsLastPageReached(result.last);
                setPage(prevPage => prevPage + 1);
                setTotalElements(result.totalElements);
            })
            .catch(error => {
                setIsNextPageLoading(false);
                setHasNextPage(false);
                setIsLastPageReached(false);
                console.log(error);
            });
    };

    return (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4">View all classes</h1>
                    <div className="text-muted ml-3 mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} classes
                    </div>
                </div>
                <ButtonGroup>
                    <RequireAuthentication
                        component={Link}
                        color="secondary"
                        size="sm"
                        className="btn btn-secondary btn-sm flex-shrink-0"
                        to={ROUTES.ADD_CLASS}
                    >
                        <Icon icon={faPlus} /> Create class
                    </RequireAuthentication>
                </ButtonGroup>
            </Container>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {classes.length > 0 && (
                        <div>
                            {classes.map(classItem => {
                                return (
                                    <ShortRecord key={classItem.id} header={classItem.label} href={reverse(ROUTES.CLASS, { id: classItem.id })}>
                                        {classItem.id}
                                    </ShortRecord>
                                );
                            })}
                        </div>
                    )}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            No Classes
                        </ListGroupItem>
                    )}
                    {isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <ListGroupItem
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                            action
                            onClick={!isNextPageLoading ? loadMoreClasses : undefined}
                        >
                            <Icon icon={faAngleDoubleDown} /> Load more classes
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page.
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Container>
        </>
    );
};

export default Classes;
