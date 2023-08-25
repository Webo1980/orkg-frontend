import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import EditFiltersOffcanvas from 'components/Observatory/Filters/Editor/EditFiltersOffcanvas';
import FilterInputField from 'components/Observatory/Filters/FilterInputField/FilterInputField';
import { SubtitleSeparator } from 'components/styled';
import PropTypes from 'prop-types';
import { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, CardFooter, Col, Container, Label, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'reactstrap';

const Filters = ({ id, filters, refreshFilter, setFilters, showResult, resetFilters }) => {
    const isCurator = useSelector(state => state.auth.user?.isCurationAllowed);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [showAllFiltersPanel, setShowAllFiltersPanel] = useState(false);

    if (filters.length === 0 && !isCurator) {
        return null;
    }

    const isShowResultActive = filters.some(f => f.value);

    const _filters = filters.filter(f => f.value).length > 0 ? filters.filter(f => f.value) : filters;

    const countFeaturedFilters = _filters.filter(f => f.featured).length;

    return (
        <Container className="p-0 mt-1">
            <Card className="border-0">
                <CardFooter className="rounded border-top-0" style={{ backgroundColor: '#dcdee6' }}>
                    <Row className="row-cols-lg-auto g-3 align-items-center">
                        <Col>Filters</Col>
                        <Col>
                            <SubtitleSeparator />
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
                                <Button size="sm" color="primary" onClick={() => setShowAllFiltersPanel(v => !v)}>
                                    All filters
                                </Button>
                            </Col>
                        )}
                        <Col>
                            <Button disabled={!isShowResultActive} size="sm" color="primary" onClick={showResult}>
                                Show result
                            </Button>
                        </Col>
                        {isShowResultActive && (
                            <Col>
                                <Button size="sm" color="light" onClick={resetFilters}>
                                    Reset
                                </Button>
                            </Col>
                        )}
                        {isCurator && (
                            <Col>
                                <Button size="sm" color="secondary" onClick={() => setShowEditPanel(v => !v)}>
                                    <Icon icon={faPen} /> Edit filters
                                </Button>
                                <EditFiltersOffcanvas
                                    id={id}
                                    isOpen={showEditPanel}
                                    toggle={() => setShowEditPanel(v => !v)}
                                    filters={filters}
                                    refreshFilter={refreshFilter}
                                    setFilters={setFilters}
                                />
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
                            <Button color="secondary" className="me-2" onClick={resetFilters}>
                                Reset
                            </Button>
                            <Button color="primary" className="me-2" onClick={showResult}>
                                Show results
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
