import { NavLink } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import moment from 'moment';

const CommentCardStyled = styled.div`
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

const DiscuccsionCard = props => {
    return (
        <CommentCardStyled className="list-group-item list-group-item-action pr-2">
            <div className="row">
                <div className="col-9 d-flex">
                    <div className="d-block">
                        {props.comment && (
                            <NavLink
                                className="p-0"
                                style={{ display: 'contents' }}
                                href={
                                    'http://localhost:4200/' +
                                    't/' +
                                    props.comment.topic_slug +
                                    '/' +
                                    props.comment.topic_id +
                                    '/' +
                                    props.comment.post_number
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {props.comment.cooked ? props.comment.cooked.replace(/(<([^>]+)>)/gi, '') : <em>No comment</em>}
                            </NavLink>
                        )}
                        <br />
                        <small>
                            {props.comment.updated_at && <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />}
                            {props.comment.updated_at ? moment(props.comment.updated_at).format('DD-MM-YYYY') : ''}
                        </small>
                    </div>
                </div>
            </div>
        </CommentCardStyled>
    );
};

DiscuccsionCard.propTypes = {
    comment: PropTypes.object
};

export default DiscuccsionCard;
