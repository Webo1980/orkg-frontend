import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Papers from 'components/ResearchProblem/Papers';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
import { getPapersFromOpenAIRE, getWorksData } from 'services/GraphQL/Graphql';
import { Container, ListGroup } from 'reactstrap';
import ContentCard from 'components/ResearchProblem/ContentCard';
import { Col, Row, Card, CardBody } from 'reactstrap';
import ContentLoader from 'react-content-loader';
import TitleBar from 'components/TitleBar/TitleBar';
import { SubTitle, SubtitleSeparator } from 'components/styled';

const ResearchProblemRelatedPapers = props => {
    const [isLoadingPapers, setIsLoadingPapers] = useState(null);
    const [data, setData] = useState(null);
    const [facets, setFacets] = useState([]);
    const [text, setText] = useState('');
    const [text1, setText1] = useState(null);
    const [copyData, setCopyData] = useState(null);
    const [label, setLabel] = useState(props.match.params.slug.replace(/_/g, ' '));
    const { slug } = props.match.params;

    useEffect(() => {
        const loadContent = async input => {
            setIsLoadingPapers(true);
            const result = [];
            let res = await getPapersFromOpenAIRE(input.toLowerCase());
            res = res.data.openAIREPapers;
            res.map(r => {
                result.push({
                    title: r.title,
                    id: r.doi,
                    authors: r.authors,
                    abstract: r.abstract
                });
            });
            setData(result);
            setIsLoadingPapers(false);
        };

        loadContent(label);
    }, [label]);

    return (
        <>
            <TitleBar
                titleAddition={
                    <>
                        <SubtitleSeparator />
                        <SubTitle>{label}</SubTitle>
                    </>
                }
                wrap={false}
            >
                Related papers
            </TitleBar>
            <Container className="mt-4">
                <Row>
                    <Col className="col-12">
                        <div className="box p-4">
                            {!isLoadingPapers && data && (
                                <ListGroup>
                                    {data ? (
                                        <>
                                            {data.map(o => {
                                                //console.log(o.id);
                                                return <ContentCard objectInformation={o} />;
                                            })}
                                            {/* {console.log(data.doi)} */}
                                        </>
                                    ) : (
                                        <div className="text-center mt-4 mb-4">No Papers</div>
                                    )}
                                </ListGroup>
                            )}
                        </div>
                    </Col>
                </Row>
                {isLoadingPapers && (
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-left">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};

ResearchProblemRelatedPapers.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            slug: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchProblemRelatedPapers;
