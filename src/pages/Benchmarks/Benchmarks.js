import { useState } from 'react';
import ContentLoader from 'react-content-loader';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import BenchmarkCard from 'components/Benchmarks/BenchmarkCard/BenchmarkCard';
import useBenchmarks from 'components/Benchmarks/hooks/useBenchmarks';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Row, Container } from 'reactstrap';
import { SearchStyled, InputStyled, SearchButtonStyled } from 'components/styled';
import PWCProvenanceBox from 'components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';

function Benchmarks() {
    const { benchmarks, isLoadingBenchmarks } = useBenchmarks();
    const [filter, setFilter] = useState('');

    return (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4 m-0">View all benchmarks</h1>
                    <div className="text-muted ml-3 mt-1">
                        {benchmarks.length === 0 && isLoadingBenchmarks ? <Icon icon={faSpinner} spin /> : benchmarks.length} benchmarks{' '}
                        {!!filter &&
                            `(${benchmarks.filter(b => b.research_problem.label.toLowerCase().includes(filter.toLowerCase())).length} filtered)`}
                    </div>
                </div>

                <SearchStyled className="btn btn-secondary btn-sm active">
                    <InputStyled type="text" placeholder="Search benchmarks..." value={filter} onChange={e => setFilter(e.target.value)} />
                    <SearchButtonStyled size="sm" className="px-3" color="link">
                        <Icon icon={faSearch} />
                    </SearchButtonStyled>
                </SearchStyled>
            </Container>
            <Container className="box rounded p-4 clearfix">
                <div className="d-flex">
                    <div>
                        <p>
                            <i>Benchmarks</i> organize the state-of-the-art empirical research within research fields and are powered in part by
                            automated information extraction within a human-in-the-loop curation model.{' '}
                        </p>
                        <div>
                            Further information about benchmarks can be also found in the{' '}
                            <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Benchmarks" target="_blank" rel="noopener noreferrer">
                                ORKG wiki
                            </a>
                        </div>
                    </div>
                    <PWCProvenanceBox />
                </div>
                <hr />
                <Row className="mt-3 flex-grow-1 justify-content-center">
                    {benchmarks?.length > 0 &&
                        benchmarks
                            .filter(b => b.research_problem.label.toLowerCase().includes(filter.toLowerCase()) || filter === '')
                            .map(benchmark => {
                                return <BenchmarkCard key={`${benchmark.research_problem.id}`} benchmark={benchmark} />;
                            })}
                </Row>

                {benchmarks.length === 0 && !isLoadingBenchmarks && <div className="text-center mt-4 mb-4">No benchmarks yet!</div>}
                {benchmarks.length !== 0 &&
                    benchmarks.filter(b => b.research_problem.label.toLowerCase().includes(filter.toLowerCase())).length === 0 &&
                    !isLoadingBenchmarks && <div className="text-center mt-4 mb-4">Sorry, no benchmarks found - try a different search query</div>}
                {isLoadingBenchmarks && (
                    <div className="text-center mt-4 mb-4">
                        <div className="mt-3">
                            <div>
                                <ContentLoader
                                    height="10%"
                                    width="100%"
                                    viewBox="0 0 100 10"
                                    style={{ width: '100% !important' }}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="2" y="0" rx="2" ry="2" width="20" height="10" />
                                    <rect x="27" y="0" rx="2" ry="2" width="20" height="10" />
                                    <rect x="52" y="0" rx="2" ry="2" width="20" height="10" />
                                    <rect x="77" y="0" rx="2" ry="2" width="20" height="10" />
                                </ContentLoader>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
}

export default Benchmarks;
