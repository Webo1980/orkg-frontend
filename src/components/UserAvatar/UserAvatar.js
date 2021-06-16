import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import { getContributorInformationById } from 'services/backend/contributors';
import Gravatar from 'react-gravatar';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { MISC } from 'constants/graphSettings';

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.lightDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }
`;

export const StyledSpinnerGravatar = styled.div`
    width: ${props => props.size};
    height: ${props => props.size};
    display: inline-block;
    text-align: center;
    line-height: ${props => props.size};
    color: ${props => props.theme.secondary};
    border: 2px solid ${props => props.theme.lightDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }

    background-color: ${props => props.theme.lightDarker};
`;

const UserAvatar = ({ userId, size, appendToTooltip, showDisplayName }) => {
    const [contributor, setContributor] = useState(null);
    const [isLoadingContributor, setIsLoadingContributor] = useState(true);

    useEffect(() => {
        if (userId) {
            setIsLoadingContributor(true);
            getContributorInformationById(userId)
                .then(result => {
                    setContributor(result);
                    setIsLoadingContributor(false);
                })
                .catch(() => {
                    setIsLoadingContributor(false);
                });
        }
    }, [userId]);

    return (
        <>
            {userId && userId !== MISC.UNKNOWN_ID && (
                <Tippy
                    offset={[0, 10]}
                    placement="bottom"
                    content={`${contributor?.display_name}${appendToTooltip}`}
                    disabled={showDisplayName || !userId || !contributor || isLoadingContributor}
                >
                    <span>
                        <Link to={reverse(ROUTES.USER_PROFILE, { userId: userId })}>
                            {!isLoadingContributor && (
                                <StyledGravatar className="rounded-circle" md5={contributor?.gravatar_id ?? 'example@example.com'} size={size} />
                            )}
                            {userId && isLoadingContributor && (
                                <StyledSpinnerGravatar className="rounded-circle" size="28px">
                                    <Icon icon={faSpinner} spin />
                                </StyledSpinnerGravatar>
                            )}
                        </Link>
                        {showDisplayName && !isLoadingContributor && (
                            <Link to={reverse(ROUTES.USER_PROFILE, { userId: userId })}>{!isLoadingContributor && contributor.display_name}</Link>
                        )}
                    </span>
                </Tippy>
            )}
        </>
    );
};

UserAvatar.propTypes = {
    userId: PropTypes.string,
    size: PropTypes.number,
    appendToTooltip: PropTypes.string,
    showDisplayName: PropTypes.bool
};

UserAvatar.defaultProps = {
    size: 28,
    appendToTooltip: '',
    showDisplayName: false
};

export default UserAvatar;
