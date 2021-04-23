import { Label, ListGroup, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

const HoverButton = styled(Button)`
    margin: 0 2px !important;
    border-radius: 100% !important;
    height: 24px;
    width: 24px;
`;

export default function BioassaySelectItem(props) {
    return (
        <ListGroup className="listGroupEnlarge">
            <div>
                {Object.keys(props.data.labels).map(labelKey => (
                    <StatementsGroupStyle key={`p${props.data.properties[labelKey]}`} className="noTemplate">
                        <div className="row no-gutters">
                            <PropertyStyle className="col-4" tabIndex="0">
                                <div className="propertyLabel">
                                    <Label>
                                        <Link
                                            className="text-dark"
                                            target="_blank"
                                            to={reverse(ROUTES.PROPERTY, { id: props.data.properties[labelKey] })}
                                        >
                                            {labelKey}
                                        </Link>
                                    </Label>
                                </div>
                            </PropertyStyle>
                            <ValuesStyle className="col-8 valuesList">
                                <ListGroup flush className="px-3">
                                    {props.data.labels[labelKey].map(value => (
                                        <ValueItemStyle key={`p${props.data.resources[value]}`} className="d-flex">
                                            <div className="flex-grow-1">
                                                <Label>
                                                    <Link target="_blank" to={reverse(ROUTES.RESOURCE, { id: props.data.resources[value] })}>
                                                        {value}
                                                    </Link>
                                                </Label>
                                            </div>
                                            <HoverButton
                                                color="lightblue"
                                                className="p-0"
                                                size="sm"
                                                onClick={() => props.handleDeleteValue(labelKey, value)}
                                            >
                                                <Tippy content="Delete value">
                                                    <span>
                                                        <Icon icon={faTrash} />
                                                    </span>
                                                </Tippy>
                                            </HoverButton>
                                        </ValueItemStyle>
                                    ))}
                                </ListGroup>
                            </ValuesStyle>
                        </div>
                    </StatementsGroupStyle>
                ))}
            </div>
        </ListGroup>
    );
}

BioassaySelectItem.propTypes = {
    data: PropTypes.object.isRequired,
    handleDeleteValue: PropTypes.func.isRequired
};
