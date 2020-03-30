import styled from 'styled-components';

export const StyledSideBar = styled.div`
    border-radius: 6px;
    border-width: 1px;
    border-color: rgb(219, 221, 229);
    border-style: solid;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left-width: 0;
`;

export const SideBarHeaderStyle = styled.div`
    padding: 12px 15px;
    background-color: #e9ecef;
    color: #212529;
    font-weight: normal;
`;

export const StyledGraggableData = styled.ul`
    list-style: none;
    padding-left: 0;
    padding-right: 0;
    max-height: 400px;
    overflow: scroll;
    overflow-x: hidden;

    &.scrollbox {
        overflow: auto;
        background: /* Shadow covers */ linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
            /* Shadows */ radial-gradient(50% 0, farthest-side, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)),
            radial-gradient(50% 100%, farthest-side, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)) 0 100%;
        background: /* Shadow covers */ linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
            /* Shadows */ radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)),
            radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)) 0 100%;
        background-repeat: no-repeat;
        background-color: white;
        background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
        /* Opera doesn't support this in the shorthand */
        background-attachment: local, local, scroll, scroll;
    }
`;

export const StyledDraggableResource = styled.li`
    position: relative;
    cursor: move;
    margin-bottom: 8px;
    transition: 0.3s background;
    border: dotted 1px;
    border-radius: ${props => props.theme.borderRadius};
    box-shadow: -2px 0px 2px 0px rgba(0, 0, 0, 0.1);
    padding: 9px 9px 9px 15px;

    font-size: small;

    &.selected {
        background: #c2dbff;
    }

    &.dragging {
        opacity: 0.5;
    }

    & .dragIcon {
        visibility: hidden;
    }

    &:hover .dragIcon {
        visibility: visible;
    }
`;
