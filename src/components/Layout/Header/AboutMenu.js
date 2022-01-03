import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { getAboutPagesMenu } from 'services/cms';
import { reverseWithSlug } from 'utils';
import { reverse } from 'named-urls';
import styled from 'styled-components';

const StyledButtonDropdown = styled(UncontrolledButtonDropdown)`
    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        .dropdown-menu {
            position: relative !important;
            transform: none !important;
            border: 0 !important;
        }
    }
`;

const AboutMenu = ({ closeMenu }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const getItems = async () => {
            setItems(await getAboutPagesMenu());
        };
        getItems();
    }, []);

    return (
        <StyledButtonDropdown direction="right" className="w-100 nav inNavbar">
            <DropdownToggle
                onClick={() => (items.length > 0 ? null : closeMenu())}
                to={reverse(ROUTES.ABOUT, {})}
                tag={items.length > 0 ? 'button' : RouterNavLink}
                className="dropdown-item w-100"
            >
                About {items.length > 0 && <Icon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />}
            </DropdownToggle>
            {items.length > 0 && (
                <DropdownMenu>
                    {items.map(({ id, title }) => (
                        <DropdownItem
                            key={id}
                            tag={RouterNavLink}
                            exact
                            to={reverseWithSlug(ROUTES.ABOUT, { id, slug: title })}
                            onClick={() => closeMenu()}
                        >
                            {title}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            )}
        </StyledButtonDropdown>
    );
};

AboutMenu.propTypes = {
    closeMenu: PropTypes.func.isRequired
};

export default AboutMenu;
