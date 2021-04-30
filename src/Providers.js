import env from '@beam-australia/react-env';
import { createInstance, MatomoProvider } from '@datapunt/matomo-tracker-react';
import { ConnectedRouter } from 'connected-react-router';
import PropTypes from 'prop-types';
import { CookiesProvider } from 'react-cookie';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import configureStore, { history } from './store';
import 'assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

const matomoInstance =
    env('MATOMO_TRACKER') === 'true'
        ? createInstance({
              urlBase: 'https://www.orkg.org/',
              siteId: env('MATOMO_TRACKER_SITE_ID'),
              trackerUrl: `${env('MATOMO_TRACKER_URL')}matomo.php`,
              srcUrl: `${env('MATOMO_TRACKER_URL')}matomo.js`,
              disabled: false,
              linkTracking: true,
              trackPageView: true,
              configurations: {
                  disableCookies: true
              }
          })
        : undefined;

const Providers = ({
    children,
    // eslint-disable-next-line import/no-webpack-loader-syntax
    theme = require('sass-extract-loader?{plugins: ["sass-extract-js"]}!./assets/scss/ThemeVariables.scss'),
    store = configureStore(),
    routerNoInitialPop = false
}) => (
    <DndProvider backend={HTML5Backend}>
        <CookiesProvider>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <MatomoProvider value={matomoInstance}>
                        <ConnectedRouter history={history} noInitialPop={routerNoInitialPop}>
                            {children}
                        </ConnectedRouter>
                    </MatomoProvider>
                </ThemeProvider>
            </Provider>
        </CookiesProvider>
    </DndProvider>
);

Providers.propTypes = {
    children: PropTypes.node.isRequired,
    theme: PropTypes.object,
    store: PropTypes.object,
    routerNoInitialPop: PropTypes.bool
};

export default Providers;
