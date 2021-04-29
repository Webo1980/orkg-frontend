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

const StatementsGroupStyled = styled(StatementsGroupStyle)`
    .delete_property {
        visibility: hidden;
    }
    &:hover {
        .delete_property {
            visibility: visible;
        }
    }
`;

export default function BioassaySelectItem(props) {
    return (
        <ListGroup className="listGroupEnlarge">
            <div>
                {Object.keys(props.data.labels).map(labelKey => (
                    <StatementsGroupStyled key={`p${props.data.properties[labelKey]}`} className="noTemplate">
                        <div className="row no-gutters">
                            <PropertyStyle className="col-4" tabIndex="0">
                                <div className="propertyLabel">
                                    <Label className=" mr-2">
                                        <Link
                                            className="text-dark"
                                            target="_blank"
                                            to={reverse(ROUTES.PROPERTY, { id: props.data.properties[labelKey] })}
                                        >
                                            {labelKey}
                                        </Link>
                                    </Label>
                                    <Button
                                        color="link delete_property"
                                        className="p-0"
                                        size="sm"
                                        onClick={() => props.handleDeleteProperty(labelKey)}
                                    >
                                        <Tippy content="Delete property">
                                            <span>
                                                <Icon icon={faTrash} color="#80869b" />
                                            </span>
                                        </Tippy>
                                    </Button>
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
                                            <Button color="link" className="p-0" size="sm" onClick={() => props.handleDeleteValue(labelKey, value)}>
                                                <Tippy content="Delete value">
                                                    <span>
                                                        <Icon icon={faTrash} color="#80869b" />
                                                    </span>
                                                </Tippy>
                                            </Button>
                                        </ValueItemStyle>
                                    ))}
                                </ListGroup>
                            </ValuesStyle>
                        </div>
                    </StatementsGroupStyled>
                ))}
            </div>
        </ListGroup>
    );
}

BioassaySelectItem.propTypes = {
    data: PropTypes.object.isRequired,
    handleDeleteValue: PropTypes.func.isRequired,
    handleDeleteProperty: PropTypes.func.isRequired
};
