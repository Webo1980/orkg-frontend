import { forwardRef } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const OptionButtonStyled = styled.span`
    .btn {
        display: inline-block;
        border-radius: 6px;
        background-color: ${props => props.theme.lightDarker};
        color: ${props => props.theme.dark};
        border-width: 0;

        & .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 2.25rem;
            font-size: 1rem;
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

const ActionButtonView = forwardRef((props, ref) => (
    <OptionButtonStyled ref={ref} tabIndex="0" className="me-2">
        <Button className="p-0" color="link" onClick={props.action}>
            <span className="icon-wrapper">
                <Icon size={props.size} icon={props.icon} />
            </span>
        </Button>
    </OptionButtonStyled>
));
ActionButtonView.displayName = 'ActionButtonView';
ActionButtonView.propTypes = {
    title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    icon: PropTypes.object.isRequired,
    size: PropTypes.isRequired,
    action: PropTypes.func,
};

export default ActionButtonView;
