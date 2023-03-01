import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { MISC } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';

const CreatedByBadge = ({ creator = null }) =>
    creator && creator !== MISC.UNKNOWN_ID ? (
        <Badge color="light" className="me-2">
            <Icon icon={faUser} /> Created by{' '}
            <span className="ms-1 d-inline-block" style={{ marginTop: -30, marginBottom: -30 }}>
                <UserAvatar size={20} userId={creator} showDisplayName={true} />
            </span>
        </Badge>
    ) : null;

CreatedByBadge.propTypes = {
    creator: PropTypes.string,
};

export default CreatedByBadge;
