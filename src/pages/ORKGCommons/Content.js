import { useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByObservatoryId } from 'services/backend/observatories';
import PaperCard from 'components/PaperCard/PaperCard';
import ContentLoader from 'react-content-loader';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import Papers from 'pages/Papers';
import { getWorksData, getWorksDataByString } from 'services/backend/Graphql';
import ContentCard from './ContentCard';
import REGEX from 'constants/regex';
import { Col, Row, Card, CardBody } from 'reactstrap';
import { Input, Button, Label, FormGroup, Alert, CustomInput, InputGroupAddon, InputGroup } from 'reactstrap';
import { easeElastic } from 'd3';

const Content = input => {
    const [isLoadingPapers, setIsLoadingPapers] = useState(null);
    const [data, setData] = useState(null);
    const [facets, setFacets] = useState([]);
    const [text, setText] = useState('');
    const [text1, setText1] = useState(null);
    const [copyData, setCopyData] = useState(null);

    useEffect(() => {
        const loadContent = async input => {
            setIsLoadingPapers(true);
            const result = [];
            if (REGEX.DOI.test(input)) {
                await getWorksData().then(r => {
                    //console.log(r.data.Paper);
                    //setData(r.data.work);
                    //result.push({
                    //id: r.data.work.id,
                    //title: r.data.work.titles[0].title,
                    //authors: r.data.work.creators,
                    //citations: r.data.work.citations
                    //});
                    result.push({
                        title: r.data.Paper[0].label,
                        id: r.data.Paper[0].resource_id,
                        authors: r.data.Paper[0].authors
                    });
                    setIsLoadingPapers(false);
                });
                //console.log(result);
                setData(result);
            } else {
                //console.log(input.input);
                //getWorksDataByString(input.input).then(r => {
                //r.data.findPaperByLabel.map(e => {
                //result.push({
                //title: e.label,
                //authors: e.authors,
                //contributions: e.contributions
                //});
                getWorksDataByString(input.input).then(r => {
                    //console.log(r.data.Resource);
                    for (let i = 0; i < r.data.Resource.length; i++) {
                        if (r.data.Resource[i].relatedPapers) {
                            const d = r.data.Resource[i].relatedPapers;
                            for (let j = 0; j < d.length; j++) {
                                //console.log(d[j].paper);
                                result.push({
                                    title: d[j].paper.label,
                                    id: d[j].paper.resource_id,
                                    details: d[j].details ? d[j].details : ''
                                });
                            }
                        }
                    }
                    //r.data.Resource.map(e => {
                    //console.log(e);
                    //if (e) {
                    //console.log(e.details);
                    //result.push({
                    //title: e.paper.label,
                    //id: e.paper.resource_id,
                    //details: e.details
                    //});
                    //}
                    //});
                    //console.log(r.data.findPaperByLabel);
                    setIsLoadingPapers(false);
                });
                setData(result);
                console.log(result);
            }
        };

        loadContent(input);
    }, [input]);

    const getValue = e => {
        console.log(e);
        setText(e);
    };

    const getValue1 = e => {
        console.log(e);
        setText1(e);
    };

    const search = () => {
        console.log('9');
        setData(data.filter(o1 => o1.details.average < text1));
    };

    const getFacets = i => {
        //console.log(i);
        const c = facets;
        if (i.length > 0) {
            //console.log(i[0].contribution_details);
            console.log(i[0]);
            for (let j = 0; j < i[0].contribution_details.length; j++) {
                console.log(i[0].contribution_details[j].property.label + ' - ' + i[0].contribution_details[j].label);
                const f = c.filter(o1 => o1.property === i[0].contribution_details[j].property.label);
                if (f.length == 0) {
                    c.push({ property: i[0].contribution_details[j].property.label, label: [i[0].contribution_details[j].label] });
                } else {
                    if (f.length != 0) {
                        f[0].label.push(i[0].contribution_details[j].label);
                    }
                }
            }
            setFacets(c);
            console.log(facets);
        }
    };

    return (
        <>
            <Container className="mt-4">
                <Row>
                    {!isLoadingPapers && data && (
                        <Col className="col-4">
                            <div className="box p-4">
                                {/* Filter 1: <Input id="search_content" onChange={e => getValue(e.target.value)} value={text} /> */}
                                {/* <br /> */}
                                Filter 1: <Input id="search_content1" onChange={e => getValue1(e.target.value)} value={text1} />
                                <br />
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3"
                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                    onClick={() => search()}
                                >
                                    Search
                                </Button>
                            </div>
                        </Col>
                    )}
                    <Col className="col-8">
                        <div className="box p-4">
                            {!isLoadingPapers && data && (
                                <ListGroup>
                                    {/* {console.log(data.length)} */}
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

Content.propTypes = {
    input: PropTypes.string
};

export default Content;
