import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Papers from 'components/ResearchProblem/Papers';
import ResearchProblemHeader from 'components/ResearchProblem/ResearchProblemHeader';
import { getPapersFromSemanticScholar, getWorksData } from 'services/GraphQL/Graphql';
import { ListGroup, Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col } from 'reactstrap';
import ContentCard from 'components/ResearchProblem/ContentCard';
import ContentLoader from 'react-content-loader';
import TitleBar from 'components/TitleBar/TitleBar';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import styled from 'styled-components';
import LOGO from 'assets/img/poweredby/semanticscholar.svg';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { submitPostRequest } from 'network';

const SSBoxStyled = styled.div`
    border: 2px solid ${props => props.theme.light};
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    align-items: center;

    &:hover {
        border: 2px solid ${props => props.theme.secondary};
    }
`;

const ResearchProblemRelatedPapers = props => {
    const [menuOpen, setMenuOpen] = useState(false);
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
            let res = await getPapersFromSemanticScholar(input.toLowerCase());
            res = res.data.semanticScholarPapers;
            setData(res);
            //console.log(res);
            //res.map(r => {
            //console.log(r);
            //result.push({
            //title: r.title,
            //id: r.doi,
            //authors: r.authors,
            //abstract: r.abstract,
            //year: r.year,
            //peerReview: r.peerReview.type,
            //citations: r.peerReview.citationCount
            //});
            //});
            //setData(result);
            setIsLoadingPapers(false);
        };

        loadContent(label);
    }, [label]);

    const importPapers = () => {
        if (!isLoadingPapers && data) {
            console.log('9');
            data.map(r => {
                const bioassay = r.abstract;
                const annotation = submitPostRequest('http://localhost:8072/bioassay/', { 'Content-Type': 'application/json' }, { bioassay });
                console.log(annotation);
                annotation.then(ann => {
                    console.log(ann);
                });
            });
        }
    };

    return (
        <>
            <TitleBar
                titleAddition={
                    <>
                        <SubtitleSeparator />
                        <SubTitle>{label}</SubTitle>
                    </>
                }
                buttonGroup={
                    // <div>
                    // <a href="https://www.semanticscholar.org/" target="_blank" rel="noopener noreferrer" className="text-center">
                    // <SSBoxStyled>
                    // <small>Data originally imported from</small>
                    // <img className="p-2" src={LOGO} alt="papers with code logo" style={{ maxWidth: 200, maxHeight: 60 }} />
                    // </SSBoxStyled>
                    // </a>
                    // </div>
                    <>
                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right">
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem onClick={() => importPapers()}> Import papers </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </>
                }
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
