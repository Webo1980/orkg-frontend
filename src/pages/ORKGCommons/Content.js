import { useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByObservatoryId } from 'services/backend/observatories';
import PaperCard from 'components/PaperCard/PaperCard';
import ContentLoader from 'react-content-loader';
import { getPaperData } from 'utils';
import { find, property } from 'lodash';
import PropTypes from 'prop-types';
import Papers from 'pages/Papers';
import { getWorksData, getPapersbyLabelfromORKG } from 'services/backend/Graphql';
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
            const value = input.input;
            const result = [];
            console.log(value);
            if (REGEX.DOI.test(value)) {
                await getWorksData(value).then(r => {
                    if (r.data) {
                        console.log(r.data.work);
                        result.push({
                            title: r.data.work.titles[0].title,
                            id: r.data.work.id,
                            authors: r.data.work.creators.map(c => {
                                return { name: c.givenName + ' ' + c.familyName, id: c.id };
                            })
                        });
                    }
                    //setData(r.data.work);
                    //result.push({
                    //id: r.data.work.id,
                    //title: r.data.work.titles[0].title,
                    //authors: r.data.work.creators,
                    //citations: r.data.work.citations
                    //});
                    setIsLoadingPapers(false);
                });
                console.log(result);
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
                let t = [];
                getPapersbyLabelfromORKG(input.input).then(r => {
                    //console.log(r.data.Resource);
                    const papers = r.data.papers;
                    console.log(papers.length);
                    for (let i = 0; i < papers.length; i++) {
                        result.push({
                            title: papers[i].label ? papers[i].label : papers[i].label,
                            id: papers[i].doi?.label ? papers[i].doi.label : '',
                            authors: papers[i].authors.map(c => {
                                return { name: c.label, id: c.id?.label ? c.id.label : '' };
                            })
                        });
                        let r = getFacets(papers[i].contributions);
                        //console.log(...r);
                        t.push(...r);
                        //if (r.data.Resource[i].relatedPapers) {
                        //const d = r.data.Resource[i].relatedPapers;
                        //for (let j = 0; j < d.length; j++) {
                        //console.log(d[j].paper);
                        //result.push({
                        //title: d[j].paper.label,
                        //id: d[j].paper.resource_id,
                        //details: d[j].details ? d[j].details : ''
                        //});
                        //}
                    }
                    console.log(t);
                    const uniqueNames = Array.from(new Set(t));
                    console.log(uniqueNames);
                    //uniqueCount = ["a","b","c","d","d","e","a","b","c","f","g","h","h","h","e","a"];
                    let count = {};
                    t.forEach(function(i) {
                        count[i] = (count[i] || 0) + 1;
                    });
                    console.log(count);
                    let sk = Object.keys(count).sort(function(a, b) {
                        return count[b] - count[a];
                    });
                    setFacets(sk.slice(0, 10));
                    //}
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
                console.log(facets);
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

    const getFacets = contributions => {
        //console.log(i);
        let properties = [];
        if (contributions.length > 0) {
            //console.log(i[0].contribution_details);
            //console.log(contributions[0]);
            for (let j = 0; j < 1; j++) {
                if (contributions[j].details.length > 0) {
                    let details = contributions[j].details;
                    for (let k = 0; k < details.length; k++) {
                        //console.log(details[k].property);
                        let found = properties.filter(o => o === details[k].property);
                        if (found.length == 0) {
                            properties.push(details[k].property);
                        }
                        //console.log(properties.filter(o => o === details[k].property));
                        //console.log('.......');
                        //console.log(properties.filter(o => o === details[k].property));
                        //console.log('-------');
                    }
                    //console.log(contributions[j].details);
                }
                //console.log(contributions[0].contribution_details[j].property.label + ' - ' + i[0].contribution_details[j].label);
                //const f = c.filter(o1 => o1.property === i[0].contribution_details[j].property.label);
                // if (f.length == 0) {
                //c.push({ property: i[0].contribution_details[j].property.label, label: [i[0].contribution_details[j].label] });
                //} else {
                //if (f.length != 0) {
                //f[0].label.push(i[0].contribution_details[j].label);
                //}
                //}
            }
            //setFacets(c);
            //console.log(facets);
            console.log('............');
            //console.log(properties);
            //console.log('------------');
            return properties;
        }
    };

    return (
        <>
            <Container className="mt-4">
                <Row>
                    {!isLoadingPapers && data && (
                        <Col className="col-4">
                            <div className="box p-4">
                                {facets.length}
                                {facets.length > 0 && (
                                    <div>
                                        {facets.map(f => {
                                            return (
                                                <>
                                                    <div> {f} </div>
                                                    <Input id="search_content1" onChange={e => getValue1(e.target.value)} value={text1} />
                                                </>
                                            );
                                        })}
                                    </div>
                                )}
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
