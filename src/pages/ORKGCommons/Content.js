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
import Joi from 'joi';
import DisplayFacets from './DisplayFacets';

const Content = input => {
    const [isLoadingPapers, setIsLoadingPapers] = useState(null);
    const [data, setData] = useState(null);
    const [facets, setFacets] = useState(null);
    const [text, setText] = useState('');
    const [text1, setText1] = useState(null);
    const [rp, setrp] = useState(null);
    const [researchProblems, setResearchProblems] = useState(null);
    const [inputList, setInputList] = useState({});

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
                    setIsLoadingPapers(false);
                });
                setData(result);
            } else {
                let t = [];
                let rProblems = [];
                getPapersbyLabelfromORKG(input.input).then(r => {
                    const papers = r.data.papers;
                    for (let i = 0; i < papers.length; i++) {
                        result.push({
                            title: papers[i].label ? papers[i].label : papers[i].label,
                            id: papers[i].doi?.label ? papers[i].doi.label : '',
                            authors: papers[i].authors.map(c => {
                                return { name: c.label, id: c.id?.label ? c.id.label : '' };
                            })
                        });
                        let contributions = papers[i].contributions;
                        if (contributions.length > 0) {
                            for (let j = 0; j < 1; j++) {
                                if (contributions[j].details.length > 0) {
                                    let details = contributions[j].details;
                                    for (let k = 0; k < details.length; k++) {
                                        if (details[k].property.includes('research problem')) {
                                            //console.log(details[k].label);
                                            rProblems.push(details[k].label);
                                        }
                                    }
                                }
                            }
                        }
                    }
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
            }
        };

        loadContent(input);
    }, [input]);

    const getValue = e => {
        console.log(e.label);
        setrp(e);
        getPapersByProblem(e.label);
    };

    const getPapersByProblem = problem => {
        const result = [];
        let filters = [];
        let rProblems = [];
        console.log(problem);
        getPapersbyProblem(problem).then(r => {
            const papers = r.data.problems[0].papers;
            for (let i = 0; i < papers.length; i++) {
                result.push({
                    title: papers[i].label ? papers[i].label : papers[i].label,
                    id: papers[i].doi?.label ? papers[i].doi.label : '',
                    authors: papers[i].authors.map(c => {
                        return { name: c.label, id: c.id?.label ? c.id.label : '' };
                    })
                });
                let r = getFacets(papers[i].contributions);
                filters.push(...r);
            }
            // deal it as a dynamic form problem
            // {key: 'upper limitmin', value:0}
            //console.log(t);
            const uniqueNames = Array.from(new Set(filters));
            getFiltersValues(uniqueNames, papers);
            //let count = {};
            //t.forEach(function(i) {
            //count[i] = (count[i] || 0) + 1;
            //});
            //let sk = Object.keys(count).sort(function(a, b) {
            //return count[b] - count[a];
            //});
            //setIsLoadingPapers(false);
            //const uniqueP = Array.from(new Set(rProblems));
            //console.log(uniqueP);
            //let temp = [];
            //temp.push({ value: '', label: '' });
            //for (r = 0; r < uniqueP.length; r++) {
            //temp.push({ value: uniqueP[r], label: uniqueP[r] });
            //}
            setData(result);
        });
    };

    const getFiltersValues = (filters, papers) => {
        let filterValues = {};
        for (let i = 0; i < filters.length; i++) {
            filterValues[filters[i]] = [];
        }
        for (let i = 0; i < papers.length; i++) {
            let contributions = papers[i].contributions;
            if (contributions.length > 0) {
                for (let j = 0; j < contributions.length; j++) {
                    if (contributions[j].details.length > 0) {
                        let details = contributions[j].details;
                        for (let k = 0; k < details.length; k++) {
                            if (details[k].property in filterValues) {
                                filterValues[details[k].property].push(details[k].label);
                            }
                        }
                    }
                }
                console.log('............');
            }
        }
        let temp = [];
        let list = {};
        for (const [key, _] of Object.entries(filterValues)) {
            if (!filterValues[key].every((val, i, arr) => val === arr[0])) {
                let type = analyzeValues(filterValues[key]);
                temp.push({ value: key, type: type });
                //list[`${key}min`] = 0;
                //list[`${key}max`] = 0;
            }
        }
        //setInputList(list);
        setFacets(temp);
        //console.log(inputList);
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
                    }
                }
            }
            return properties;
        }
    };

    const analyzeValues = values => {
        let output = '';
        if (values.length === values.filter(value => !isNaN(value) && !isNaN(parseFloat(value))).length) {
            output = 'num';
            console.log('true');
        } else if (
            values.length ===
            values.filter(value => {
                const { error } = Joi.date()
                    .required()
                    .validate(value);
                return !error ? true : false;
            }).length
        ) {
            console.log('true');
            output = 'date';
        } else if (values.length !== values.filter(value => value.split(' ').length < 6).length) {
            console.log('true');
            output = 'string';
        } else if (values.length > 1) {
            output = 'category';
        }
        return output;
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
                                {console.log(facets)}
                                {facets && facets.length > 0 && <DisplayFacets facets={facets} />}
                                {/* {facets && facets.length > 0 && ( */}
                                {/* <div> */}
                                {/* {facets.map(f => { */}
                                {/* return ( */}
                                {/* <> */}
                                {/* <div> */}
                                {/* {f.value} {f.type} */}
                                {/* </div> */}
                                {/* {getFilters(f.type, f.value)} */}
                                {/* <Input id="search_content1" onChange={e => getValue1(e.target.value)} value={text1} /> */}
                                {/* </> */}
                                {/* ); */}
                                {/* })} */}
                                {/* </div> */}
                                {/* )} */}
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3"
                                    // onClick={() => search()}
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
                                    {data ? (
                                        <>
                                            {data.map(o => {
                                                return <ContentCard objectInformation={o} />;
                                            })}
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
