import styled from 'styled-components';

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
