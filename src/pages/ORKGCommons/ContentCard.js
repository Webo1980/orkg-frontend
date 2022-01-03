import { CustomInput } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import AddToComparison from 'components/ViewPaper/AddToComparison';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NavLink } from 'reactstrap';
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
    //const comparison = useSelector(state => state.viewPaper.comparison);

    return (
        <PaperCardStyled className="list-group-item list-group-item-action pr-2">
            <div className="row">
                <div className="d-flex">
                    <div className="d-block">
                        {console.log(props.objectInformation)}
                        {props.objectInformation && (
                            <>
                                {console.log(encodeURIComponent(props.objectInformation.doi))}
                                {/* <a href={`${ROUTES.PAPER_DETAIL}/${props.objectInformation.id}`} target="_blank" rel="noopener noreferrer"> */}
                                {/* {props.objectInformation.title ? props.objectInformation.title : <em>No title</em>} */}
                                {/* </a> */}
                                <Link to={reverse(ROUTES.PAPER_DETAIL, { doi: encodeURIComponent(props.objectInformation.id) })}>
                                    {props.objectInformation.title ? props.objectInformation.title : <em>No title</em>}
                                </Link>{' '}
                            </>
                        )}
                        <br />
                        <small>
                            {props.objectInformation.authors && (
                                <>
                                    {props.objectInformation.authors.map((r, index) => {
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
