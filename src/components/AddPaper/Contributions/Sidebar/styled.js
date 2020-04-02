import styled from 'styled-components';

export const StyledSideBar = styled.div`
    border-radius: 6px;
    border-width: 1px;
    border-color: rgb(219, 221, 229);
    border-style: solid;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left-width: 0;

    .isSticky {
    }
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
    max-height: 300px;
    overflow: scroll;
    overflow-x: hidden;
    margin-bottom: 0;

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
    background-color: #fff;
    margin-bottom: 0;
    padding: 8px 0px !important;
    border-right: 0 !important;
    border-left: 0 !important;
    border-top: 0 !important;
    border-radius: 0 !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    position: relative;
    overflow-wrap: break-word;
    cursor: move;
    font-size: small;
    .btn {
        font-size: small;
        &:hover {
            text-decoration: none;
        }
    }
    &.selected {
        background: #c2dbff;
    }

    &.dragging {
        opacity: 0.5;
    }

    & .dragIcon {
        visibility: visible;
    }

    &:hover {
        -moz-box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        z-index: 1;
        .dragIcon {
            visibility: visible;
        }
    }
`;

export const StyledStickyContainer = styled.div`
    &.isSticky {
        margin-top: 100px;
    }
`;
