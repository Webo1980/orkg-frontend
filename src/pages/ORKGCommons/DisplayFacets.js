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

const DisplayFacets = props => {
    const [isLoadingFacets, setIsLoadingFacets] = useState(null);
    //const [data, setData] = useState(null);
    const [text, setText] = useState('');
    const [text1, setText1] = useState(null);
    const [rp, setrp] = useState(null);
    const [researchProblems, setResearchProblems] = useState(null);
    const [inputList, setInputList] = useState({});

    useEffect(() => {
        const addFacetsDefaultValues = async input => {
            setIsLoadingFacets(true);
            console.log(input);
            //let v = input.facets;
            let v = input;
            let list = [];
            for (let i = 0; i < input.length; i++) {
                list[`max${v[i].value}`] = 0;
                list[`min${v[i].value}`] = 0;
            }
            //getFacetsData(list);
            //console.log(props.getFacetsData);
            //props.getFacetsData(list);
            setInputList(list);
            setIsLoadingFacets(false);
        };

        addFacetsDefaultValues(props.facets);
    }, [props.facets]);

    const getFilters = (value, type) => {
        //console.log(inputList);
        if (type == 'num') {
            return (
                <div style={{ display: 'flex' }}>
                    <FormGroup>
                        <Input
                            type="number"
                            id={`min${value}`}
                            placeholder="9"
                            value={inputList[`min${value}`]}
                            name={`min${value}`}
                            onChange={e => handleChange(e, value)}
                            style={{
                                marginRight: '0.5rem',
                                width: '130px',
                                height: '39px'
                            }}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Input
                            type="number"
                            id={`max${value}`}
                            placeholder="9"
                            value={inputList[`max${value}`]}
                            name={`max${value}`}
                            onChange={e => handleChange(e, value)}
                            style={{
                                marginLeft: '0.5rem',
                                width: '130px',
                                height: '40px'
                            }}
                        />
                    </FormGroup>
                </div>
            );
        }
    };

    const search = () => {
        console.log('9');
        props.getFacetsData(inputList);
        //getFacetsData(inputList);
    };

    const handleChange = (e, field) => {
        e.preventDefault();
        const list = { ...inputList };
        //console.log(list);
        list[e.target.name] = parseInt(e.target.value);
        setInputList(list);
        //list[`${field}min`] = parseInt(e.target.value);
        //console.log(list);
        //setText(e.target.value);
        //console.log(inputList);
        //const list = [{ ...inputList }];
        //console.log(list);
        //list[key + 'min'] = 0;
        //list[key + 'max'] = 0;
        //const { name, value } = e.target;
        //const list = [...inputList];
        //list[index][name] = value;
        //console.log(setInputList(list));
    };

    const reset = () => {
        const list = { ...inputList };
        console.log(list);
        for (const [key, _] of Object.entries(list)) {
            list[key] = 0;
        }
        setInputList(list);
        props.getFacetsData(inputList);
    };

    return (
        <>
            {console.log('.......')}
            {!isLoadingFacets && props.facets && props.facets.length > 0 && (
                <div>
                    {props.facets.map(f => {
                        if (f.type === 'num') {
                            return (
                                <>
                                    <div>
                                        {f.value}
                                        {/* <FormGroup> */}
                                        {/* <Input */}
                                        {/* type="number" */}
                                        {/* id={`max${f.value}`} */}
                                        {/* placeholder="9" */}
                                        {/* value={inputList[`max${f.value}`]} */}
                                        {/* name={`max${f.value}`} */}
                                        {/* onChange={e => handleChange(e, f.value)} */}
                                        {/* /> */}
                                        {/* </FormGroup> */}
                                        {getFilters(f.value, f.type)}
                                    </div>
                                    {/* {getFilters(f.type, f.value)} */}
                                    {/* <Input id="search_content1" onChange={e => getValue1(e.target.value)} value={text1} /> */}
                                </>
                            );
                        }
                    })}
                    <Button color="primary" className="pl-2 pr-2 btn-sm" onClick={() => search()}>
                        Search
                    </Button>{' '}
                    <Button color="primary" className="pl-2 pr-2 btn-sm" onClick={() => reset()}>
                        Reset
                    </Button>
                </div>
            )}
        </>
    );
};

DisplayFacets.propTypes = {
    facets: PropTypes.array,
    getFacetsData: PropTypes.func.isRequired
};

export default DisplayFacets;
