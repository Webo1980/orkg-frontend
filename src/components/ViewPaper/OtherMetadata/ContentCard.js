import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Badge } from 'reactstrap';
import ROUTES from 'constants/routes';

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

const ContentCard = props => {
    return (
        <PaperCardStyled className="list-group-item list-group-item-action">
            <div className="row">
                <div className="d-flex">
                    <div className="d-block">
                        {props.paper && (
                            <>
                                <Link
                                    to={reverse(ROUTES.PAPER_DETAIL, {
                                        doi: encodeURIComponent(props.paper.id.replace('https://doi.org/', ''))
                                    })}
                                >
                                    {props.paper.title ? props.paper.title : <em>No title</em>}
                                </Link>{' '}
                            </>
                        )}
                        <br />
                        <small>
                            {props.paper.authors && (
                                <>
                                    {props.paper.authors.map((r, index) => {
                                        if (r.name) {
                                            return (
                                                <>
                                                    {r.id ? (
                                                        <Link
                                                            to={reverse(ROUTES.RESEARCHER_DETAIL, { orcid: r.id.replace('https://orcid.org/', '') })}
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
                        </small>
                    </div>
                </div>
            </div>
        </PaperCardStyled>
    );
};

ContentCard.propTypes = {
    paper: PropTypes.object
};

export default ContentCard;
