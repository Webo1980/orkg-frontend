import { useState } from 'react';
import { Label, ListGroup, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { getPredicates, createPredicate } from 'services/backend/predicates';
import { getResources, createResource } from 'services/backend/resources';
import Tippy from '@tippyjs/react';
import { prefillStatements } from 'actions/addPaper';
import { useDispatch, useSelector } from 'react-redux';
import { isBioassay } from 'actions/addPaper';

const HoverButton = styled(Button)`
    margin: 0 2px !important;
    border-radius: 100% !important;
    height: 24px;
    width: 24px;
`;

export default function BioassaySelectItem(props) {
    const dispatch = useDispatch();
    const [statementData, setStatementData] = useState(props.data);
    const thisBioassay = useSelector(state => state.addPaper.isBioassay);

    const handleDeleteValue = (property, valueKey) => {
        if (statementData[property].constructor === Array && statementData[property].length > 1) {
            const { ...state } = statementData;
            state[property].splice(valueKey, 1);
            setStatementData(state);
        } else {
            const { [property]: tmp, ...rest } = statementData;
            setStatementData(rest);
        }
    };

    const statementGenerator = (property, values, count) => {
        let values_array = [];
        if (values.constructor !== Array) {
            values_array.push(values);
        } else {
            values_array = values;
        }

        return (
            <StatementsGroupStyle key={count} className="noTemplate">
                <div className="row no-gutters">
                    <PropertyStyle key={property} className="col-4" tabIndex="0">
                        <div className="propertyLabel">
                            <Label>{property}</Label>
                        </div>
                    </PropertyStyle>
                    <ValuesStyle className="col-8 valuesList">
                        <ListGroup flush className="px-3">
                            {values_array.map((value, index) => {
                                return (
                                    <ValueItemStyle key={count + index}>
                                        <div>
                                            <Label>{value}</Label>
                                            <HoverButton
                                                color="lightblue"
                                                className="float-right p-0"
                                                size="sm"
                                                onClick={() => handleDeleteValue(property, index)}
                                            >
                                                <Tippy content="Delete value">
                                                    <span>
                                                        <Icon icon={faTrash} color="#fff" />
                                                    </span>
                                                </Tippy>
                                            </HoverButton>
                                        </div>
                                    </ValueItemStyle>
                                );
                            })}
                        </ListGroup>
                    </ValuesStyle>
                </div>
            </StatementsGroupStyle>
        );
    };

    const handleLoadStatements = () => {
        const statements = [];
        let statement;
        let count = 100;
        for (const [key, value] of Object.entries(statementData)) {
            if (!value) {
                continue;
            }
            statement = statementGenerator(key, value, count);
            statements.push(statement);
            count += 100;
        }
        return statements;
    };

    const handleConfirmInput = async () => {
        // confirm selection and input the data to StatementBrowser
        props.loadingData();
        const statements = await createStatementIdObject();

        console.log(statements);
        // insert into statement Browser
        await dispatch(
            prefillStatements({
                statements,
                resourceId: props.id
            })
        );
        props.selectionFinished();

        const finishedBioIds = thisBioassay.finished;
        finishedBioIds[props.id] = true;
        dispatch(isBioassay({ bioassay: true, finished: finishedBioIds }));
    };

    const createStatementIdObject = async () => {
        // append list values as strings
        const statements = { properties: [], values: [] };

        const predicate_requests = await send_requests(Object.keys(statementData), true);
        const resource_requests = await send_requests(Object.values(statementData).flat(), false);

        const lookup = { ...predicate_requests, ...resource_requests };

        for (const [key, values] of Object.entries(statementData)) {
            statements['properties'].push({
                propertyId: lookup[key],
                label: key
            });

            if (values.constructor !== Array) {
                statements['values'].push({
                    label: values,
                    type: 'object',
                    valueId: lookup[values],
                    propertyId: lookup[key]
                });
            } else {
                if (values.length === 1) {
                    statements['values'].push({
                        label: values[0],
                        type: 'object',
                        valueId: lookup[values.join()],
                        propertyId: lookup[key]
                    });
                } else {
                    for (const value of values) {
                        statements['values'].push({
                            label: value,
                            type: 'object',
                            valueId: lookup[value],
                            propertyId: lookup[key]
                        });
                    }
                }
            }
        }
        console.log(statements);
        return statements;
    };

    const send_requests = async (query_values, predicate) => {
        const lookup = {};
        let getAll;

        if (predicate) {
            getAll = getPredicates;
        } else {
            getAll = getResources;
        }
        for (const value of query_values) {
            const response = getAll({
                page: 1,
                sortBy: 'id',
                desc: true,
                q: value,
                returnContent: true
            });
            if (response.length > 0) {
                lookup[response[0].label] = response[0].id;
            } else {
                if (predicate) {
                    const newPredicate = await createPredicate(value, []);
                    lookup[value] = newPredicate.id;
                } else {
                    const newResource = await createResource(value, []);
                    lookup[value] = newResource.id;
                }
            }
        }
        return lookup;
    };

    return (
        <ListGroup className="listGroupEnlarge">
            <div>
                {handleLoadStatements()}
                <div className="text-right" style={{ paddingTop: '4px' }}>
                    <Button color="primary" className="mt-4" size="sm" onClick={handleConfirmInput}>
                        Confirm
                    </Button>
                </div>
            </div>
        </ListGroup>
    );
}

BioassaySelectItem.propTypes = {
    data: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    selectionFinished: PropTypes.func.isRequired,
    loadingData: PropTypes.func.isRequired
};
