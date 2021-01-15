import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import configureStore, { history } from './store';
import { ThemeProvider } from 'styled-components';
import { shallow } from 'enzyme';

// Extract Sass variables into a JS object
// eslint-disable-next-line import/no-webpack-loader-syntax
// https://github.com/adamgruber/sass-extract-js/issues/12
export const theme = {
    orkgBorderRadius: '6px',
    orkgPrimaryColor: 'rgb(232, 97, 97)',
    orkgBorderWidth: '1px',
    primary: 'rgb(232, 97, 97)',
    darkblue: 'rgb(128, 134, 155)',
    darkblueDarker: 'rgb(80, 85, 101)',
    light: 'rgb(233, 236, 239)',
    ultraLightBlue: 'rgb(248, 249, 251)',
    ultraLightBlueDarker: 'rgb(219, 221, 229)',
    bodyBg: 'rgb(233, 235, 242)',
    bodyColor: 'rgb(79, 79, 79)',
    borderWidth: '1px',
    borderRadius: '6px',
    themeColors: {
        lightblue: 'rgb(233, 235, 242)',
        darkblue: 'rgb(128, 134, 155)',
        darkblueDarker: 'rgb(80, 85, 101)',
        primaryDarker: 'rgb(198, 29, 29)'
    },
    formFeedbackFontSize: '90%',
    inputBorderRadius: '6px',
    inputBorderRadiusSm: '6px',
    btnBorderRadius: '6px',
    btnBorderRadiusSm: '6px',
    btnBorderRadiusLg: '6px',
    inputBg: 'rgb(247, 247, 247)',
    inputBtnPaddingX: '30px',
    inputPaddingX: '0.75rem',
    btnPaddingXSm: '1.25rem',
    dropdownLinkHoverBg: 'rgb(233, 233, 233)',
    customCheckboxIndicatorBorderRadius: '3px',
    headingsFontWeight: 400,
    headingsColor: 'rgb(55, 63, 69)',
    modalContentBorderRadius: '11px',
    modalContentBorderWidth: '3px',
    badgeFontSize: '85%',
    badgeFontWeight: 500,
    badgePaddingY: '0.3rem',
    badgePaddingX: '0.8rem',
    listGroupBorderColor: 'rgba(0, 0, 0, 0.125)',
    buttonDark: 'rgb(91, 97, 118)',
    avatarBorderColor: 'rgb(103, 109, 129)'
};
it('renders without crashing', () => {
    const div = document.createElement('div');
    const store = configureStore();

    ReactDOM.render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <App history={history} />
            </ThemeProvider>
        </Provider>,
        div
    );
});

it('renders without crashing', () => {
    shallow(<App />);
});
