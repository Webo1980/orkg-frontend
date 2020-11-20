import styled from 'styled-components';
import { Button } from 'reactstrap';

export const StyledWorkSpace = styled.div`
    display: flex;
    flex: 1;
    justify-content: center;

    background-color: var(--background);
    background-position-x: var(--offset-x);
    background-position-y: var(--offset-y);
    background-size: calc(var(--grid-size) * 3) calc(var(--grid-size) * 3);
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOnAAADpwBB5RT3QAAABZ0RVh0Q3JlYXRpb24gVGltZQAwMy8yMi8yMM3KBJQAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAB7ElEQVR4nO3dUW1CQRRF0TsNMjDQb3Ripg4QUBf4eBUBO49O1lJwbrKT+Zw1Mz8z85j/7zozz7NHvMEWd1xm5nEcx/3sIa9aa92O4/g9e8erdrnj6+wB7ElYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCSERUJYJIRFQlgkhEVCWCQuM3Nda93OHvIG32utsze8wxZ3XGbmucOPnmutccfn8BSSEBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCT+sfp4t7vDD6ofZ5Q5PIQlhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZH4A5/pKth/6zgKAAAAAElFTkSuQmCC');

    margin: 0;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    overflow: hidden;

    /* Variables */
    --offset-x: 0px;
    --offset-y: 0px;
    --grid-size: 15px;

    --link-selected: #3ec1ff;

    --link-unselected: ${props => props.theme.darkblue};

    --background: #eee;

    --selected-opacity: 95%;
    --unselected-opacity: 95%;

    --port-unconnected: #ddd;
    --port-unconnected-text: #333;
    --port-connected-unselected-text: #fff;
    --port-hover: var(--link-selected);
    --port-connected-border: #4f4f4f;
    --port-unconnected-border: #333;
    --port-width: 2px;

    --border-selected: ${props => props.theme.orkgPrimaryColor};
    --border-unselected: ${props => props.theme.darkblue};
    --border-width: 2;

    --body-unselected: rgba(233, 235, 242, var(--selected-opacity));
    --body-selected: rgba(233, 235, 242, var(--unselected-opacity));
`;

export const Shape = styled.div`
    position: relative;
    background: ${props => (props.selected ? 'var(--body-selected)' : 'var(--body-unselected)')};
    border: 2px solid ${props => (props.selected ? 'var(--border-selected)' : 'var(--border-unselected)')};
    transition: 100ms linear;
    border-radius: 4px;
    font-size: 11px;
    min-width: 300px;
`;

export const Title = styled.div`
    background: ${props => props.theme.darkblue};
    display: flex;
    white-space: nowrap;
    justify-items: center;
    padding: 5px 5px;
    flex-grow: 1;
    font-size: 12px;
    color: white;
    .option {
        visibility: hidden;
        cursor: pointer;
    }
    :hover {
        .option {
            visibility: visible;
        }
    }
`;

export const StyledAddProperty = styled(Button)`
    border-radius: 0 !important;
    border-width: 1px 0 0 0 !important;
    &:first-child,
    &:first-child:hover {
        border-width: 1px 0 0 0 !important;
        border-radius: 0 !important;
    }
    &:last-child,
    &:last-child:hover {
        border-width: 1px 0 0 1px !important;
        border-radius: 0 !important;
    }
    font-size: 11px;
    flex-grow: 1;
`;

export const PropertyItem = styled.div`
    padding: 4px;
    display: flex;
    .option {
        visibility: hidden;
        cursor: pointer;
    }
    :hover {
        background: #fff;
        .option {
            visibility: visible;
        }
    }
`;

export const Fieldset = styled.fieldset`
    legend {
        font-size: 1.2rem !important;
    }
`;
