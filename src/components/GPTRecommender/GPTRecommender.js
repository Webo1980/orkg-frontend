import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getGPTRecommendations } from 'services/orkgNlp';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import Tippy, { useSingleton } from '@tippyjs/react';
import Tooltip from 'components/Utils/Tooltip';
import { Input, Label, List, ListInlineItem, Badge, Card, CardBody, CardHeader } from 'reactstrap';
import { useSelector } from 'react-redux';

const styles = {
    recommendationsList: {
        maxWidth: '100%',
        maxHeight: '150px',
        overflowY: 'auto',
        padding: '5px',
    },
    labels: {
        color: 'black',
    },
};

const GPT_PROMPTS_TEMPLATE = {
    ADD_PAPER_PREDICATE_REC_WITH_RESEARCH_FEILD: 'Can you provide a list of properties that encapsulate the RESEARCH_FEILD_PLACEHOLDER research theme? Provide your response as a comma seperated string',
    ADD_PAPER_PREDICATE_REC_WITH_RESEARCH_FEILD_CONTEXT: 'Can you provide a list of properties that encapsulate the RESEARCH_FEILD_PLACEHOLDER research theme from the provided Context below? Provide your response as a comma seperated string. \nContext: CONTEXT_PLACEHOLDER ',
};

const getPropmt = (researchField, context) => {
    if (researchField.length < 0) {
        throw new Error('Research field is empty');
    }
    let promptTemplateKey = (context.length > 0) ? 'ADD_PAPER_PREDICATE_REC_WITH_RESEARCH_FEILD_CONTEXT' : 'ADD_PAPER_PREDICATE_REC_WITH_RESEARCH_FEILD';
    let promptTemplate = GPT_PROMPTS_TEMPLATE[promptTemplateKey];
    let filledPrompt = promptTemplate.replace('RESEARCH_FEILD_PLACEHOLDER', researchField).replace('CONTEXT_PLACEHOLDER', context);
    return filledPrompt;
};

const GPTRecommender = ({ selectedResearchFieldId = '' }) => {
    const researchFields = useSelector(state => state.addPaper.researchFields);
    const title = useSelector(state => state.addPaper.title);
    const abstract = useSelector(state => state.addPaper.abstract);
    const researchFieldObj = researchFields.find(field => field.id === selectedResearchFieldId);
    const contextInitialValue = title.concat('\n', abstract);

    const [loading, setLoading] = useState(false);
    const [researchFieldError, setResearchFieldError] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [researchFieldLabel, setResearchFieldLabel] = useState(researchFieldObj.label);
    const [context, setContext] = useState('');
    useEffect(() => {
        setTimeout(() => {
            setContext(contextInitialValue);
        }, 1000);
    }, [contextInitialValue]);

    const fetchRecommendation = useCallback((researchField, context) => {
        const inputPrompt = getPropmt(researchField, context);
        getGPTRecommendations({ inputPrompt })
            .then(result => {
                const recommendationsArray = result.split(',');
                setRecommendations(recommendationsArray);
                setLoading(false);
                setResearchFieldError(false);
            })
            .catch(() => { });
    }, []);

    const handleResearchFieldChange = event => {
        setResearchFieldLabel(event.target.value);
    };

    const handleContextChange = event => {
        setContext(event.target.value);
    };

    const handleButtonClick = () => {
        if (!researchFieldLabel) {
            setResearchFieldError(true);
            return;
        }
        setLoading(true);
        fetchRecommendation(researchFieldLabel, context);
    };
    const [source, target] = useSingleton();

    return (

        <div>
            <Card
                className="my-2"
                color="light-lighter"
                inverse
                style={{
                    width: '18rem',
                }}
            >
                <CardHeader>
                    <Tippy singleton={source} delay={500} />

                    <h3 className="h5 mb-3">
                        <Tooltip message="The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these suggestions is optional.">
                            AI Recommender
                        </Tooltip>
                    </h3>
                </CardHeader>
                <CardBody>
                    <Label for="researchField" style={styles.labels}>
                        Research Field
                    </Label>
                    <Input
                        id="researchField"
                        name="researchField"
                        placeholder="Research Field"
                        type="text"
                        value={researchFieldLabel}
                        onChange={handleResearchFieldChange}
                    />
                    {researchFieldError ? (
                        <p className={`text-danger mt-2 ps-2 primary ${!researchFieldError ? ' d-none' : ''}`} style={{ borderLeft: '4px red solid' }}>
                            Please enter the research field
                        </p>
                    ) : (
                        <></>
                    )}
                    <br />
                    <Label for="context" style={styles.labels}>
                        Context
                    </Label>
                    <Input
                        id="context"
                        name="context"
                        placeholder="Context"
                        type="textarea"
                        value={context}
                        onChange={handleContextChange}
                    />
                    <br />
                    <ButtonWithLoading
                        color="primary"
                        loadingMessage="Loading"
                        size="sm"
                        onClick={handleButtonClick}
                        isLoading={loading}
                    >
                        Get AI Recommendations!
                    </ButtonWithLoading>
                    <br />
                    <br />
                    <List type="inline" style={styles.recommendationsList}>
                        {recommendations.map((recommendation, index) => (
                            <ListInlineItem key={index}><Badge color="light">{recommendation}</Badge></ListInlineItem>
                        ))}
                    </List>
                </CardBody>
            </Card>
        </div>

    );
};

GPTRecommender.propTypes = {
    selectedResearchFieldId: PropTypes.string,
};

export default GPTRecommender;
