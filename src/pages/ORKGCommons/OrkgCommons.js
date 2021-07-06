import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { createGlobalStyle } from 'styled-components';
import { Input, Label, FormGroup, Alert, CustomInput, InputGroupAddon, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { getWorksData } from 'services/backend/Graphql';
import { generateDOIForComparison, createObject } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import { getComparison, createResourceData } from 'services/similarity/index';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import AuthorsInput from 'components/Utils/AuthorsInput';
import ShareCreatedContent from 'components/ShareLinkMarker/ShareCreatedContent';
import NewerVersionWarning from 'components/Comparison/HistoryModal/NewerVersionWarning';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { useHistory } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
import { getPropertyObjectFromData } from 'utils';
import styled from 'styled-components';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { slugify } from 'utils';
import { PREDICATES, CLASSES, ENTITIES, MISC } from 'constants/graphSettings';
import env from '@beam-australia/react-env';
import { InputGroupButtonDropdown } from 'reactstrap';
import { StyledDropdownItem, StyledDropdownToggle } from 'components/StatementBrowser/styled';
import { HttpLink } from 'apollo-link-http';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Content from 'pages/ORKGCommons/Content';
import { Col, Row, Card, CardBody } from 'reactstrap';

const GlobalStyle = createGlobalStyle`
    // ensure printing only prints the contents and no other elements
    @media print {
        nav,
        footer,
        .woot--bubble-holder,
        .container:not(.print-only) {
            display: none !important;
        }
        .container.print-only {
            margin: 0;
            padding: 0;
            max-width: 100%;
            margin-top: -100px;
        }
        body {
            background-color: #fff !important;
        }
    }
`;

const OrkgCommons = () => {
    const [type, setType] = useState('content');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [content, setContent] = useState(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [text, setText] = useState(null);
    const [search, setSearch] = useState(false);
    useEffect(() => {
        document.title = 'ORKG Commons';
    }, []);

    const selectOption = () => {
        console.log(type);
        setIsLoadingContent(true);
        if (type === 'content') {
            const res = getWorksData();
            Promise.all([res]).then(r => {
                console.log(r);
                setContent(content);
            });
            setIsLoadingContent(false);
        } else if (type === 'people') {
            console.log('');
        } else if (type === 'organization') {
            console.log('');
        } else {
            console.log('');
        }
    };

    const getValue = e => {
        console.log(e);
        setText(e);
    };

    return (
        <>
            <Container className="mt-4">
                <div className="box p-4">
                    <FormGroup>
                        <InputGroup>
                            <InputGroupButtonDropdown addonType="append" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(v => !v)}>
                                <StyledDropdownToggle disableBorderRadiusLeft={true}>
                                    <small>{type}</small>
                                    <Icon size="xs" />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => setType('content')}>Content</StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setType('people')}>People</StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setType('organization')}>Organization</StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setType('project')}>Project</StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Input id="search_content" onChange={e => getValue(e.target.value)} value={text} />
                            <InputGroupAddon addonType="append">
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3"
                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                    onClick={() => setSearch(true)}
                                >
                                    <Icon icon={faClipboard} />
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </div>
                {console.log(content)}
            </Container>
            {text && type === 'content' && search && <Content input={text} />}
            {text && type === 'project' && search && <Content input={text} />}
        </>
    );
};

export default OrkgCommons;
