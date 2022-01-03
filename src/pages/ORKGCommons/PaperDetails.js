import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { createGlobalStyle } from 'styled-components';
import { Input, Label, FormGroup, Alert, CustomInput, InputGroupAddon, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { getWorksDataWithCitations } from 'services/backend/Graphql';
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
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { NavLink } from 'reactstrap';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Badge } from 'reactstrap';
import DetailsTabs from './DetailsTabs';

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

const PaperCardStyled = styled.div`
    & .options {
        visibility: hidden;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        visibility: visible;
    }
`;

const PaperDetails = () => {
    const [type, setType] = useState('content');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [content, setContent] = useState(null);
    const [data, setData] = useState(null);
    const [title, setTitle] = useState(null);
    const [id, setId] = useState(null);
    const [authors, setAuthors] = useState(null);
    const [citations, setCitations] = useState(null);
    const [abstract, setAbstract] = useState(null);
    const [publisher, setPublisher] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [text, setText] = useState('');
    const { doi } = useParams();
    const [search, setSearch] = useState(false);
    useEffect(() => {
        document.title = 'Paper Details';
        const getPaperData = async id => {
            console.log(id);
            setIsLoading(true);
            let result = [];
            await getWorksDataWithCitations(id).then(r => {
                if (r.data) {
                    const data = r.data.work;
                    console.log(r.data);
                    setTitle(data.titles[0].title);
                    setId(data.id);
                    let authors = data.creators.map(c => {
                        return { name: c.givenName !== null ? c.givenName + ' ' + c.familyName : '', id: c.id };
                    });
                    setAuthors(authors);
                    setCitations(data.citations.nodes);
                    setAbstract(data.descriptions[0].description ? r.data.work.descriptions[0].description : '');
                    //setPublisher(data.publisher ? data.publisher : '');
                    //result.push({
                    //title: r.data.work.titles[0].title,
                    //id: r.data.work.id,
                    //authors: r.data.work.creators.map(c => {
                    //return { name: c.givenName !== null ? c.givenName + ' ' + c.familyName : '', id: c.id };
                    //}),
                    //citations: r.data.work.citations.nodes,
                    //abstract: r.data.work.descriptions[0].description ? r.data.work.descriptions[0].description : ''
                    //});
                }
                setIsLoading(false);
            });
            //setData(result);
            //console.log(result);
        };
        getPaperData(doi);
    }, [doi]);

    const getValue = e => {
        console.log(e);
        setText(e);
    };

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <h1 className="h5 flex-shrink-0 mb-0">Paper Details</h1>
            </Container>
            <Container className="mt-4 mb-4">
                <PaperCardStyled className="mt-2 pl-4 list-group-item list-group-item-action pr-2">
                    <div className="row">
                        {!isLoading && (
                            <div className="d-flex">
                                <div className="d-block">
                                    {title && (
                                        <>
                                            <a href={`${ROUTES.PAPER_DETAIL}/${id}`} target="_blank" rel="noopener noreferrer">
                                                {title ? title : <em>No title</em>}
                                            </a>
                                        </>
                                    )}
                                    <br />
                                    <small>
                                        {authors && (
                                            <>
                                                {authors.map((r, index) => {
                                                    if (r.name) {
                                                        return (
                                                            <>
                                                                <NavLink
                                                                    className="p-0"
                                                                    style={{ display: 'contents' }}
                                                                    href={r.id ? `https://orcid/${r.id}` : ''}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Badge color="light" className="mr-2 mb-2" key={index}>
                                                                        <Icon size="sm" icon={faUser} /> {''}
                                                                        {r.name} {''}
                                                                    </Badge>
                                                                </NavLink>
                                                            </>
                                                        );
                                                    }
                                                })}
                                            </>
                                        )}
                                    </small>
                                    <br />
                                    {abstract && abstract}
                                </div>
                            </div>
                        )}
                    </div>
                </PaperCardStyled>
                {citations && <DetailsTabs objectInformation={{ citations: citations }} />}
            </Container>
        </>
    );
};

export default PaperDetails;
