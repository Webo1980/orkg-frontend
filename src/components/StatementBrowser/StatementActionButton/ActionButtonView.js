import { forwardRef } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const handleIconWrapperSize = wrappersize => {
    switch (wrappersize) {
        case 'xs':
            return '1.5rem';
        case 'lg':
            return '2.5rem';
        case 'sm':
            return '2rem';
        default:
            return '1.5rem';
    }
};

export const OptionButtonStyled = styled.span`
    :first-of-type {
        margin-left: 0 !important;
    }

    .btn {
        display: inline-block;
        border-radius: 100%;
        background-color: ${props => props.theme.lightDarker};
        color: ${props => props.theme.dark};

        & .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            height: ${({ wrappersize }) => handleIconWrapperSize(wrappersize)};
            width: ${({ wrappersize }) => handleIconWrapperSize(wrappersize)};
        }

        :hover {
            background-color: ${props => props.theme.secondary};
            color: #fff;
        }

        :focus {
            box-shadow: 0 0 0 0.2rem rgba(203, 206, 209, 0.5);
        }
    }
`;

/* Tippy doesn't work when reference element is disabled, so adding span around the button       fixes it  */
const ActionButtonView = forwardRef((props, ref) => {
    return (
        <OptionButtonStyled ref={ref} tabIndex="0" className="mx-1">
            <Button className="p-0" wrappersize={props.size} disabled={props.isDisabled} color="link" onClick={props.action} aria-label={props.title}>
                <span className="icon-wrapper">
                    <Icon size={props.size} icon={props.icon} />
                </span>
            </Button>
        </OptionButtonStyled>
    );
});

ActionButtonView.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    size: PropTypes.oneOf(['xs', 'sm', 'lg']).isRequired,
    action: PropTypes.func,
    isDisabled: PropTypes.bool
};

ActionButtonView.defaultProps = {
    size: 'xs'
};

export default ActionButtonView;
