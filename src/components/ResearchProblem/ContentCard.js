import { CustomInput } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import AddToComparison from 'components/ViewPaper/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NavLink } from 'reactstrap';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Badge } from 'reactstrap';

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
    //const comparison = useSelector(state => state.viewPaper.comparison);

    return (
        <PaperCardStyled className="list-group-item list-group-item-action pr-2">
            {console.log(props)}
            <div className="row">
                <div className="d-flex">
                    <div className="d-block">
                        {props.objectInformation && (
                            <>
                                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.objectInformation.id })}>
                                    {props.objectInformation.title ? props.objectInformation.title : <em>No title</em>}
                                </Link>{' '}
                            </>
                        )}
                        <br />
                        <small>
                            {props.objectInformation.authors && (
                                <>
                                    {props.objectInformation.authors.map((r, index) => {
                                        return (
                                            <>
                                                <NavLink
                                                    className="p-0"
                                                    style={{ display: 'contents' }}
                                                    href={r.id ? `https://orcid/${r.id.label}` : ''}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Badge color="light" className="mr-2 mb-2" key={index}>
                                                        <Icon size="sm" icon={faUser} /> {''}
                                                        {r} {''}
                                                    </Badge>
                                                </NavLink>
                                            </>
                                        );
                                    })}
                                </>
                            )}
                            {/* {props.comment.updated_at && <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />} */}
                            {/* {props.comment.updated_at ? moment(props.comment.updated_at).format('DD-MM-YYYY') : ''} */}
                        </small>
                    </div>
                </div>
            </div>
        </PaperCardStyled>
    );
};

ContentCard.propTypes = {
    objectInformation: PropTypes.object
};

export default ContentCard;
