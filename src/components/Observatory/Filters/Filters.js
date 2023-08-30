import { faPen } from '@fortawesome/free-solid-svg-icons';
import EditFiltersOffcanvas from 'components/Observatory/Filters/Editor/EditFiltersOffcanvas';
import FilterInputField from 'components/Observatory/Filters/FilterInputField/FilterInputField';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, CardFooter, Col, Container, Label, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'reactstrap';
import styled from 'styled-components';

export const Separator = styled.div`
    @media (max-width: 480px) {
        display: none;
    }
    background: ${props => props.theme.secondary};
    width: 2px;
    height: 20px;
    margin: 3px 5px 3px 0px;
    content: '';
    display: block;
    opacity: 0.7;
`;

const Filters = ({ id, filters, refreshFilter, setFilters, showResult, resetFilters }) => {
    const isCurator = useSelector(state => state.auth.user?.isCurationAllowed);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [showAllFiltersPanel, setShowAllFiltersPanel] = useState(false);

    if (filters.length === 0 && !isCurator) {
        return null;
    }

    const isShowResultActive = filters.some(f => f.value);

    const _filters = filters.filter(f => f.value).length > 1 ? filters.filter(f => f.value) : filters;

    const countFeaturedFilters = _filters.filter(f => f.featured).length;

    return (
        <Container className="p-0 mt-1">
            <Card className="border-0">
                <CardFooter className="rounded border-top-0" style={{ backgroundColor: '#dcdee6' }}>
                    <Row className="row-cols-lg-auto g-2 align-items-center">
                        <Col className="align-items-center">
                            <span className="me-1">Filters</span>
                            {isCurator && (
                                <>
                                    <StatementActionButton title="Edit filters" icon={faPen} action={() => setShowEditPanel(v => !v)} />
                                    <EditFiltersOffcanvas
                                        id={id}
                                        isOpen={showEditPanel}
                                        toggle={() => setShowEditPanel(v => !v)}
                                        filters={filters}
                                        refreshFilter={refreshFilter}
                                    />
                                </>
                            )}
                            <Separator className="float-end" />
                        </Col>

                        {_filters.slice(0, countFeaturedFilters > 2 ? countFeaturedFilters : 2).map(filter => (
                            <Fragment key={filter.id}>
                                <Col>
                                    <Label for="exampleEmail" className="col-form-label">
                                        {filter.label}
                                    </Label>
                                </Col>
                                <Col>
                                    <FilterInputField filter={filter} setFilters={setFilters} />
                                </Col>
                            </Fragment>
                        ))}
                        {filters?.length > 2 && (
                            <Col>
                                <Button size="sm" color="link" onClick={() => setShowAllFiltersPanel(v => !v)}>
                                    All filters
                                </Button>
                            </Col>
                        )}
                        {isShowResultActive && (
                            <Col>
                                <motion.div
                                    style={{ originX: 1, originY: 0 }}
                                    initial="initial"
                                    exit="initial"
                                    animate="animate"
                                    variants={{
                                        initial: { scale: 0, opacity: 0, y: -10 },
                                        animate: {
                                            scale: 1,
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                type: 'spring',
                                                duration: 0.4,
                                                delayChildren: 0.2,
                                                staggerChildren: 0.05,
                                            },
                                        },
                                    }}
                                >
                                    <Button className="me-2" disabled={!isShowResultActive} size="sm" color="primary" onClick={showResult}>
                                        Show result
                                    </Button>
                                    <Button size="sm" color="light" onClick={resetFilters}>
                                        Reset
                                    </Button>
                                </motion.div>
                            </Col>
                        )}
                    </Row>
                </CardFooter>
            </Card>
            <div className="mt-2">
                <Offcanvas direction="end" isOpen={showAllFiltersPanel} toggle={() => setShowAllFiltersPanel(v => !v)}>
                    <OffcanvasHeader toggle={() => setShowAllFiltersPanel(v => !v)}>Filters</OffcanvasHeader>
                    <OffcanvasBody>
                        <div className="mb-3">
                            {filters.map(filter => (
                                <Fragment key={filter.id}>
                                    <div className="col-auto">
                                        <Label for="exampleEmail" className="col-form-label">
                                            {filter.label}
                                        </Label>
                                    </div>
                                    <div className="col-auto">
                                        <FilterInputField filter={filter} setFilters={setFilters} />
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                        <div>
                            <Button color="primary" className="me-2" onClick={showResult}>
                                Show results
                            </Button>
                            <Button color="light" className="me-2" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </OffcanvasBody>
                </Offcanvas>
            </div>
        </Container>
    );
};

Filters.propTypes = {
    id: PropTypes.string,
    filters: PropTypes.array,
    refreshFilter: PropTypes.func,
    setFilters: PropTypes.func,
    showResult: PropTypes.func,
    resetFilters: PropTypes.func,
};

export default Filters;
