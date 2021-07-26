import 'jest-canvas-mock';
import '@testing-library/jest-dom/extend-expect';
import { server } from 'services/mocks/server';

beforeAll(() => {
    server.listen();
    jest.setTimeout(20000);
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

// required due to the usage of react-slick https://github.com/akiran/react-slick/issues/742
window.matchMedia =
    window.matchMedia ||
    function() {
        return {
            matches: false,
            addListener: function() {},
            removeListener: function() {}
        };
    };
