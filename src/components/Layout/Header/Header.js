import { useRef, useState, useEffect } from 'react';
import {
    Button,
    UncontrolledButtonDropdown,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarToggler,
    Tooltip,
    ButtonGroup,
    Row,
    Badge
} from 'reactstrap';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import Jumbotron from 'components/Home/Jumbotron';
import AddNew from './AddNew';
import SearchForm from './SearchForm';
import { ReactComponent as Logo } from 'assets/img/logo.svg';
import { ReactComponent as LogoWhite } from 'assets/img/logo_white.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import Gravatar from 'react-gravatar';
import { Cookies } from 'react-cookie';
import greetingTime from 'greeting-time';
import { useLocation } from 'react-router';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { StyledSpinnerGravatar } from 'components/UserAvatar/UserAvatar';
import { reverse } from 'named-urls';
import { useSelector } from 'react-redux';
import HomeBannerBg from 'assets/img/graph-background.svg';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import UserService from 'userService';

const cookies = new Cookies();

// determine the scroll bar width and compensate the width when a modal is opened
const GlobalStyle = createGlobalStyle`
    body.modal-open {
        #main-navbar, #paperHeaderBar {
            right: ${props => props.scrollbarWidth}px
        }
        #helpIcon {
            padding-right: ${props => props.scrollbarWidth}px
        }
        .woot-widget-bubble, .woot-widget-holder {
            margin-right: ${props => props.scrollbarWidth}px
        }
    }
    @media (min-width: 481px) and (max-width: 1100px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${props => (!props.cookieInfoDismissed ? '80px' : '14px')}
        }
    }  
    @media (max-width: 480px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${props => (!props.cookieInfoDismissed ? '150px' : '14px')}
        }
    }  
    
`;

const StyledLink = styled(Link)`
    :focus {
        outline: none;
    }
    ::-moz-focus-inner {
        border: 0;
    }
`;

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.dark};
    cursor: pointer;
`;

const StyledTopBar = styled.div`
    margin-bottom: 0;
    padding-top: 72px;

    // For the background
    background: #5f6474 url(${HomeBannerBg});
    background-position-x: 0%, 0%;
    background-position-y: 0%, 0%;
    background-size: auto, auto;
    background-size: cover;
    position: relative;
    background-attachment: fixed;
    background-position: center 10%;
    background-repeat: no-repeat;
`;

const StyledAuthTooltip = styled(Tooltip)`
    & .tooltip {
        opacity: 1 !important;
    }
    & .tooltip-inner {
        font-size: 16px;
        background-color: ${props => props.theme.secondary};
        max-width: 410px;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

        .btn {
            border-color: ${props => props.theme.secondary};
            background-color: ${props => props.theme.dark};

            &:hover {
                background-color: ${props => props.theme.secondaryDarker};
            }
        }
    }

    & .arrow:before {
        border-bottom-color: ${props => props.theme.secondary} !important;
    }
`;

const Header = () => {
    const [isOpenNavBar, setIsOpenNavBar] = useState(false);
    const [userTooltipOpen, setUserTooltipOpen] = useState(false);
    const location = useLocation();
    const [isHomePageStyle, setIsHomePageStyle] = useState(location.pathname === ROUTES.HOME ? true : false);
    const user = useSelector(state => state.auth.user);
    const userPopup = useRef(null);

    useEffect(() => {
        setIsHomePageStyle(location.pathname === ROUTES.HOME ? true : false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 0) {
                if (isHomePageStyle) {
                    setIsHomePageStyle(false);
                }
            } else {
                if (!isHomePageStyle && location.pathname === ROUTES.HOME) {
                    setIsHomePageStyle(true);
                }
            }
        };

        const handleClickOutside = event => {
            if (userPopup.current && !userPopup.current.contains(event.target) && userTooltipOpen) {
                toggleUserTooltip();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isHomePageStyle, location.pathname, userTooltipOpen]);

    const toggleNavBar = () => {
        setIsOpenNavBar(v => !v);
    };

    const toggleUserTooltip = () => {
        setUserTooltipOpen(v => !v);
    };

    const requireAuthentication = e => {
        if (!UserService.isLoggedIn()) {
            UserService.doLogin();
            // Don't follow the link when user is not authenticated
            e.preventDefault();
        }
    };

    const email = user && user.email ? user.email : 'example@example.com';
    const greeting = greetingTime(new Date());
    const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;

    return (
        <StyledTopBar className={isHomePageStyle ? 'home-page' : ''}>
            <Navbar
                light={!isHomePageStyle}
                dark={isHomePageStyle}
                className={isHomePageStyle ? 'home-page' : ''}
                expand="md"
                fixed="top"
                id="main-navbar"
            >
                <GlobalStyle scrollbarWidth={scrollbarWidth(true)} cookieInfoDismissed={cookieInfoDismissed} />

                <div
                    style={{ display: 'flex', width: '100%', transition: 'width 1s ease-in-out' }}
                    className={!isHomePageStyle ? 'p-0 container' : 'container-sm'}
                >
                    <StyledLink to={ROUTES.HOME} className="mr-4 p-0">
                        {!isHomePageStyle && <Logo />}
                        {isHomePageStyle && <LogoWhite />}
                    </StyledLink>

                    <NavbarToggler onClick={toggleNavBar} />

                    <Collapse isOpen={isOpenNavBar} navbar>
                        <Nav className="mr-auto flex-shrink-0" navbar>
                            {/* view menu */}
                            <UncontrolledButtonDropdown nav inNavbar>
                                <DropdownToggle nav className="ml-2">
                                    View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.PAPERS}>
                                        Papers
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.COMPARISONS}>
                                        Comparisons
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.VISUALIZATIONS}>
                                        Visualizations
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESEARCH_FIELDS}>
                                        Research fields
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.SMART_REVIEWS}>
                                        SmartReviews{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.BENCHMARKS}>
                                        Benchmarks
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.OBSERVATORIES}>
                                        Observatories{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.ORGANIZATIONS}>
                                        Organizations{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                    <DropdownItem divider />

                                    <DropdownItem header>Advanced views</DropdownItem>

                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESOURCES}>
                                        Resources
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.PROPERTIES}>
                                        Properties
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.CLASSES}>
                                        Classes
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>

                            {/* tools menu */}
                            <UncontrolledButtonDropdown nav inNavbar>
                                <DropdownToggle nav className="ml-2">
                                    Tools <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.TOOLS}>
                                        Tools overview
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem header>Data entry</DropdownItem>
                                    <DropdownItem
                                        tag={RouterNavLink}
                                        exact
                                        to={ROUTES.CONTRIBUTION_EDITOR}
                                        onClick={e => requireAuthentication(e, ROUTES.CONTRIBUTION_EDITOR)}
                                    >
                                        Contribution editor
                                    </DropdownItem>
                                    <DropdownItem
                                        tag={RouterNavLink}
                                        exact
                                        to={ROUTES.CSV_IMPORT}
                                        onClick={e => requireAuthentication(e, ROUTES.CSV_IMPORT)}
                                    >
                                        CSV import
                                    </DropdownItem>
                                    <DropdownItem
                                        tag={RouterNavLink}
                                        exact
                                        to={ROUTES.PDF_ANNOTATION}
                                        onClick={e => requireAuthentication(e, ROUTES.PDF_ANNOTATION)}
                                    >
                                        Survey table import
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.TEMPLATES}>
                                        Templates
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem header>Data export</DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.DATA}>
                                        Data Access
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>

                            {/* about menu */}
                            <UncontrolledButtonDropdown nav inNavbar>
                                <DropdownToggle nav className="ml-2">
                                    About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem tag="a" target="_blank" rel="noopener noreferrer" href="https://projects.tib.eu/orkg/">
                                        About ORKG <Icon size="sm" icon={faExternalLinkAlt} />
                                    </DropdownItem>
                                    <DropdownItem
                                        tag="a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://projects.tib.eu/orkg/documentation/"
                                    >
                                        Features <Icon size="sm" icon={faExternalLinkAlt} />
                                    </DropdownItem>
                                    <DropdownItem
                                        tag="a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/home"
                                    >
                                        Documentation <Icon size="sm" icon={faExternalLinkAlt} />
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.STATS}>
                                        Statistics
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </Nav>

                        <SearchForm placeholder="Search..." />

                        <AddNew isHomePageStyle={isHomePageStyle} />

                        {!!user && (
                            <div>
                                <StyledGravatar className="rounded-circle" email={email} size={40} id="CurrentUserAvatar" />
                                <StyledAuthTooltip
                                    fade={false}
                                    trigger="click"
                                    innerClassName="pr-3 pl-3 pt-3 pb-3 clearfix"
                                    placement="bottom-end"
                                    isOpen={userTooltipOpen}
                                    target="CurrentUserAvatar"
                                    toggle={toggleUserTooltip}
                                    innerRef={userPopup}
                                >
                                    <Row>
                                        <div className="col-3 text-center">
                                            <Link onClick={toggleUserTooltip} to={reverse(ROUTES.USER_PROFILE, { userId: user.id })}>
                                                <StyledGravatar
                                                    className="rounded-circle"
                                                    style={{ border: '3px solid #fff' }}
                                                    email={email}
                                                    size={76}
                                                    id="CurrentUserAvatar"
                                                />
                                            </Link>
                                        </div>
                                        <div className="col-9 text-left">
                                            <span className="ml-1">
                                                {greeting} {user.displayName}
                                            </span>
                                            <ButtonGroup className="mt-2" size="sm">
                                                <Button
                                                    color="secondary"
                                                    onClick={toggleUserTooltip}
                                                    tag={Link}
                                                    to={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                                >
                                                    Profile
                                                </Button>
                                                <Button color="secondary" onClick={() => UserService.doAccountManagement()}>
                                                    Settings
                                                </Button>
                                                <Button onClick={() => UserService.doLogout()}>Sign out</Button>
                                            </ButtonGroup>
                                        </div>
                                    </Row>
                                </StyledAuthTooltip>
                            </div>
                        )}

                        {user === 0 && (
                            <StyledSpinnerGravatar className="rounded-circle" size="35px">
                                <Icon icon={faSpinner} spin />
                            </StyledSpinnerGravatar>
                        )}
                        {user === null && (
                            <Button color="secondary" className="pl-4 pr-4 flex-shrink-0 sign-in" outline onClick={() => UserService.doLogin()}>
                                <FontAwesomeIcon className="mr-1" icon={faUser} /> Sign in
                            </Button>
                        )}
                    </Collapse>
                </div>
            </Navbar>

            {location.pathname === ROUTES.HOME && <Jumbotron />}
        </StyledTopBar>
    );
};

export default Header;
