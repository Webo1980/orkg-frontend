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
import { faGlobe, faExternalLinkAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
    const [project, setProject] = useState(null);
    const [orkgId, setOrkgId] = useState('');
    const [orkgData, setOrkgData] = useState('');
    const [topics, setTopics] = useState('');
    const [contribution, setContribution] = useState('');
    const { doi } = useParams();
    const [otherMetadata, setOtherMetadata] = useState(null);
    useEffect(() => {
        document.title = 'Paper Details';
        const getPaperData = async id => {
            console.log(id);
            setIsLoading(true);
            await getWorksDataWithCitations(id, 'paper').then(r => {
                if (r.data) {
                    const data = r.data.semanticScholarPaper;
                    console.log(r.data);
                    setTitle(data.title);
                    setId(data.doi);
                    const authors = data.authors.map(c => {
                        return { name: c, id: '' };
                    });
                    setAuthors(authors);
                    setCitations(data.work.citations.nodes);
                    setAbstract(data.abstract ? data.abstract : '');
                    setProject(data.project ? data.project : '');
                    console.log(data.project.length);
                    setOrkgId(data.Paper && data.Paper.resource_id ? data.Paper.resource_id : '');
                    setOtherMetadata({ citations: data.citations ? data.citations : '', references: data.references ? data.references : '' });
                    let p = [];
                    let ct = 0;
                    if (data.Paper && data.Paper.contributions && data.Paper.contributions.length > 0) {
                        const contributions = data.Paper.contributions;
                        if (contributions.length > 0) {
                            ct = contributions.length;
                            setContribution(contributions[1]);
                            for (let j = 0; j < 1; j++) {
                                if (contributions[j].details.length > 0) {
                                    const details = contributions[j].details;
                                    for (let k = 0; k < details.length; k++) {
                                        if (details[k].property.includes('research problem')) {
                                            console.log(p.indexOf(details[k].label));
                                            if (p.indexOf(details[k].label) === -1) {
                                                p.push(details[k].label);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    setOrkgData({ ct: ct, rp: p });
                    setTopics(data.topics ? data.topics : '');
                }
                setIsLoading(false);
            });
        };
        getPaperData(doi);
    }, [doi]);

    const getValue = e => {
        console.log(e);
    };

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <h1 className="h5 flex-shrink-0 mb-0">Paper Details</h1>
            </Container>
            <Container className="box rounded p-4 clearfix">
                {isLoading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!isLoading && (
                    <PaperCardStyled className="mt-2 pl-4 pr-4 list-group-item list-group-item-action">
                        <div className="row">
                            <div className="d-flex">
                                <div className="d-block">
                                    {title && (
                                        <>
                                            <a href={`${ROUTES.PAPER_DETAIL}/${id}`} target="_blank" rel="noopener noreferrer">
                                                {title ? title : <em>No title</em>}
                                            </a>
                                            {orkgId && (
                                                <div>
                                                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: orkgId })}>
                                                        <small>
                                                            <Icon size="sm" icon={faGlobe} /> ORKG description {''}
                                                            {id && <Icon size="sm" icon={faExternalLinkAlt} />}
                                                        </small>
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <br />
                                    {authors && (
                                        <>
                                            {authors.map((r, index) => {
                                                if (r.name) {
                                                    return (
                                                        <>
                                                            {r.id ? (
                                                                <Link
                                                                    to={reverse(ROUTES.RESEARCHER_DETAIL, {
                                                                        orcid: r.id.replace('https://orcid.org/', '')
                                                                    })}
                                                                >
                                                                    <Badge color="light" className="mr-2 mb-2" key={index}>
                                                                        <Icon size="sm" icon={faUser} className="text-primary" /> {''}
                                                                        {r.name} {''}
                                                                    </Badge>
                                                                </Link>
                                                            ) : (
                                                                <Badge color="light" className="mr-2 mb-2" key={index}>
                                                                    <Icon size="sm" icon={faUser} className="text-secondary" /> {''}
                                                                    {r.name} {''}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    );
                                                }
                                            })}
                                        </>
                                    )}
                                    <br />
                                    <small>
                                        {abstract && abstract}
                                        {orkgId && orkgData && (
                                            <div>
                                                <br />
                                                <b>Research contributions</b>: {orkgData.ct}
                                                <br />
                                                <b>Research problem</b>:
                                                {orkgData.rp.map(r => {
                                                    return <>{r}</>;
                                                })}
                                            </div>
                                        )}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </PaperCardStyled>
                )}
                <br />
                {!isLoading && citations && (
                    <DetailsTabs objectInformation={{ citations: citations, project: project, metadata: otherMetadata, topics: topics }} />
                )}
            </Container>
        </>
    );
};

export default PaperDetails;
