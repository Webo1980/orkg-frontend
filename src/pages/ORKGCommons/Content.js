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
import { getWorksData, getPapersbyLabelfromORKG, getPapersbyProblem } from 'services/backend/Graphql';
import ContentCard from './ContentCard';
import REGEX from 'constants/regex';
import { Col, Row, Card, CardBody } from 'reactstrap';
import { Input, Button, Label, FormGroup, Alert, CustomInput, InputGroupAddon, InputGroup } from 'reactstrap';
import Select from 'react-select';

const Content = input => {
    const [isLoadingPapers, setIsLoadingPapers] = useState(null);
    const [data, setData] = useState(null);
    const [facets, setFacets] = useState([]);
    const [text, setText] = useState('');
    const [text1, setText1] = useState(null);
    const [rp, setrp] = useState(null);
    const [researchProblems, setResearchProblems] = useState(null);

    useEffect(() => {
        const loadContent = async input => {
            setIsLoadingPapers(true);
            const value = input.input;
            const result = [];
            if (REGEX.DOI.test(value)) {
                await getWorksData(value).then(r => {
                    if (r.data) {
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
                let rProblems = [];
                getPapersbyLabelfromORKG(input.input).then(r => {
                    const papers = r.data.papers;
                    //const problem = r.data.problems;
                    for (let i = 0; i < papers.length; i++) {
                        result.push({
                            title: papers[i].label ? papers[i].label : papers[i].label,
                            id: papers[i].doi?.label ? papers[i].doi.label : '',
                            authors: papers[i].authors.map(c => {
                                return { name: c.label, id: c.id?.label ? c.id.label : '' };
                            })
                        });
                        let r = getFacets(papers[i].contributions);
                        t.push(...r.properties);
                        rProblems.push(...r.rProblems);
                    }
                    const uniqueNames = Array.from(new Set(t));
                    let count = {};
                    t.forEach(function(i) {
                        count[i] = (count[i] || 0) + 1;
                    });
                    let sk = Object.keys(count).sort(function(a, b) {
                        return count[b] - count[a];
                    });
                    setFacets(sk.slice(0, 10));
                    setIsLoadingPapers(false);
                    const uniqueP = Array.from(new Set(rProblems));
                    let temp = [];
                    temp.push({ value: '', label: '' });
                    for (r = 0; r < uniqueP.length; r++) {
                        temp.push({ value: uniqueP[r], label: uniqueP[r] });
                    }

                    setResearchProblems(temp);
                });
                setData(result);
                //console.log(rProblems);
            }
        };

        loadContent(input);
    }, [input]);

    const getValue = e => {
        console.log(e.label);
        setrp(e);
        const result = [];
        let t = [];
        let rProblems = [];
        getPapersbyProblem(e.label).then(r => {
            const papers = r.data.problems[0].papers;
            console.log(papers);
            //const problem = r.data.problems;
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
                t.push(...r.properties);
                rProblems.push(...r.rProblems);
            }
            console.log(t);
            const uniqueNames = Array.from(new Set(t));
            console.log(uniqueNames);
            let count = {};
            t.forEach(function(i) {
                count[i] = (count[i] || 0) + 1;
            });
            console.log(count);
            let sk = Object.keys(count).sort(function(a, b) {
                return count[b] - count[a];
            });
            setFacets(sk.slice(0, 10));
            setIsLoadingPapers(false);
            const uniqueP = Array.from(new Set(rProblems));
            console.log(uniqueP);
            let temp = [];
            temp.push({ value: '', label: '' });
            for (r = 0; r < uniqueP.length; r++) {
                temp.push({ value: uniqueP[r], label: uniqueP[r] });
            }

            setResearchProblems(temp);
            setData(result);
        });
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
        let properties = [];
        let rProblems = [];
        if (contributions.length > 0) {
            for (let j = 0; j < 1; j++) {
                if (contributions[j].details.length > 0) {
                    let details = contributions[j].details;
                    for (let k = 0; k < details.length; k++) {
                        let found = properties.filter(o => o === details[k].property);
                        if (found.length == 0) {
                            properties.push(details[k].property);
                        }
                        if (details[k].property.includes('research problem')) {
                            //console.log(details[k].label);
                            rProblems.push(details[k].label);
                        }
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
            return { properties, rProblems };
        }
    };

    const executeQuery = q => {
        console.log(q);
        //getPaperData();
    };

    return (
        <>
            <Container className="mt-4">
                <Row>
                    {!isLoadingPapers && data && (
                        <Col className="col-4">
                            <div className="box p-4">
                                {/* Research problem: <Input id="problem_content" onChange={e => getValue(e.target.value)} value={text} /> */}
                                Research Problem:
                                <Select
                                    value={rp}
                                    onChange={v => getValue(v)}
                                    onClick={v => getValue(v)}
                                    options={researchProblems}
                                    blurInputOnSelect
                                    openMenuOnFocus
                                    className="flex-grow-1 mr-1 focus-primary"
                                    classNamePrefix="react-select"
                                    placeholder="Select research problem"
                                />
                                <br />
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
