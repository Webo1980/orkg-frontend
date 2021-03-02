import { useState } from 'react';
import { Label, ListGroup, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

//  - dispatch(prefillStatements({ statements, resourceId: contributionID, syncBackend: false }));
//  - use key to delete statements -> key={`value${value.id}`}

const HoverButton = styled(Button)`
    margin: 0 2px !important;
    color: light;
    border-radius: 100% !important;
    height: 24px;
    width: 24px;
    :hover {
        color: secondary;
        cursor: pointer;
    }
`;

export default function BioassaySelectItem(props) {
    const [statementData, setStatementData] = useState(props.data);

    const handleDeleteValue = (property, valueKey) => {
        if (statementData[property].constructor === Array && statementData[property].length > 1) {
            const { ...state } = statementData;
            state[property].splice(valueKey, 1);
            setStatementData(state);
        } else {
            console.log(statementData[property]);
            const { [property]: tmp, ...rest } = statementData;
            console.log(rest);
            setStatementData(rest);
        }

        console.log(statementData);
        console.log(property, valueKey);
    };

    const statementGenerator = (property, values) => {
        let values_array = [];
        if (values.constructor !== Array) {
            values_array.push(values);
        } else {
            values_array = values;
        }

        return (
            <StatementsGroupStyle className="noTemplate">
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
                                    <ValueItemStyle key={index}>
                                        <div>
                                            <Label>{value}</Label>
                                            <HoverButton className="float-right p-0" size="sm" onClick={() => handleDeleteValue(property, index)}>
                                                <Icon icon={faTrash} style={{ color: 'light' }} />
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
        for (const [key, value] of Object.entries(statementData)) {
            if (!value) {
                continue;
            }
            statement = statementGenerator(key, value);
            statements.push(statement);
        }
        return statements;
    };

    const handleConfirmInput = () => {
        // confirm selection and input the data to StatementBrowser
    };

    return (
        <ListGroup className="listGroupEnlarge">
            {handleLoadStatements()}
            <div className="text-right" style={{ paddingTop: '4px' }}>
                <Button color="primary" className="mt-4" size="sm" onClick={handleConfirmInput}>
                    Confirm
                </Button>
            </div>
        </ListGroup>
    );
}

BioassaySelectItem.propTypes = {
    data: PropTypes.object.isRequired
};
