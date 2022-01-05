import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { createGlobalStyle } from 'styled-components';
import { Input, Label, FormGroup, Alert, CustomInput, InputGroupAddon, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { getResearcherDetails } from 'services/backend/Graphql';
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
import { faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Badge } from 'reactstrap';
import ResearcherDetailsTabs from './ResearcherDetailsTabs';
import { faGlobe, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

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

const AuthorMetaInfo = styled.div`
    .key {
        font-weight: bolder;
    }
    .value {
        margin-bottom: 10px;
    }
`;

const ResearcherDetails = () => {
    const [type, setType] = useState('content');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [content, setContent] = useState(null);
    const [data, setData] = useState(null);
    const [name, setName] = useState(null);
    const [id, setId] = useState(null);
    const [publications, setPublications] = useState(null);
    const [datasets, setDatasets] = useState(null);
    const [softwares, setSoftwares] = useState(null);
    const [citations, setCitations] = useState(null);
    const [abstract, setAbstract] = useState(null);
    const [publisher, setPublisher] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [project, setProject] = useState(null);
    const [orkgId, setOrkgId] = useState('');
    const { orcid } = useParams();
    const [otherMetadata, setOtherMetadata] = useState(null);
    useEffect(() => {
        document.title = 'Paper Details';
        const getResearcherData = async id => {
            console.log(id);
            setIsLoading(true);
            let result = [];
            await getResearcherDetails(`https://orcid.org/${id}`).then(r => {
                if (r.data) {
                    const data = r.data.person;
                    setName(data.name);
                    setId(data.id);
                    console.log(data.publications.totalCount > 0 ? data.publications.nodes : ['']);
                    setPublications(data.publications.totalCount > 0 ? data.publications.nodes : ['']);
                    setDatasets(data.datasets.totalCount > 0 ? data.datasets.nodes : ['']);
                    setSoftwares(data.softwares.totalCount > 0 ? data.softwares.nodes : ['']);
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
        getResearcherData(orcid);
    }, [orcid]);

    const getValue = e => {
        console.log(e);
    };

    return (
        <>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && (
                <div>
                    <Container className="p-0 d-flex align-items-center">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Author: {name}</h1>
                    </Container>
                    <Container className="p-0">
                        <div className="box rounded p-4 mb-3">
                            {orcid && (
                                <AuthorMetaInfo>
                                    <div className="key">
                                        ORCID <Icon color="#A6CE39" icon={faOrcid} />
                                    </div>
                                    <div className="value">
                                        <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noopener noreferrer">
                                            {orcid} <Icon icon={faExternalLinkAlt} />
                                        </a>
                                    </div>
                                </AuthorMetaInfo>
                            )}
                        </div>
                    </Container>
                </div>
            )}
            {name && !isLoading && (
                <ResearcherDetailsTabs objectInformation={{ publications: publications, datasets: datasets, softwares: softwares }} />
            )}
        </>
    );
};

export default ResearcherDetails;
