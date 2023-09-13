'use client';

import env from 'components/NextJsMigration/env';
import { plugins } from '@citation-js/core';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';
import theme from 'assets/scss/ThemeVariables';
import { MathJaxContext } from 'better-react-mathjax';
import MATH_JAX_CONFIG from 'constants/mathJax';
import REGEX from 'constants/regex';
import 'fast-text-encoding/text.min';
// import 'jspdf/dist/polyfills.es.js';
// import 'react-app-polyfill/ie9';
// import 'react-app-polyfill/stable';
import { CookiesProvider } from 'react-cookie';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import configureStore from 'store';
import { ThemeProvider } from 'styled-components';
import DefaultLayout from 'components/Layout/DefaultLayout';
import 'assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
import 'intro.js/introjs.css';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-csl';
import { detect } from 'detect-browser';
import ScrollToTop from 'components/ScrollToTop';
import { Alert } from 'reactstrap';
import { Helmet } from 'react-helmet';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import StyledComponentsRegistry from 'lib/registry';
import PropTypes from 'prop-types';

config.autoAddCss = false;

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
                  disableCookies: true,
              },
          })
        : undefined;

// https://github.com/citation-js/citation-js/issues/182
plugins.input.add('@doi/api', {
    parseType: {
        dataType: 'String',
        predicate: REGEX.DOI_URL,
        extends: '@else/url',
    },
});
plugins.input.add('@doi/id', {
    parseType: {
        dataType: 'String',
        predicate: REGEX.DOI_ID,
    },
});

// const { store, history } = configureStore();
const { store } = configureStore();

// Configuration for citation-js bibtex plubin
const configCitationJs = plugins.config.get('@bibtex');
configCitationJs.format.useIdAsLabel = true;

const alertStyle = { borderRadius: '0', marginTop: '-30px', marginBottom: '30px' };

const RootLayout = ({ children }) => {
    const browser = detect();
    const [showBrowserWarning] = useState(browser && browser.name === 'ie');

    useEffect(() => {
        if (env('CHATWOOT_WEBSITE_TOKEN')) {
            // eslint-disable-next-line wrap-iife
            ((d, t) => {
                const BASE_URL = 'https://app.chatwoot.com';
                const g = d.createElement(t);
                const s = d.getElementsByTagName(t)[0];
                g.src = `${BASE_URL}/packs/js/sdk.js`;
                s.parentNode.insertBefore(g, s);
                g.onload = () => {
                    window.chatwootSDK.run({
                        websiteToken: env('CHATWOOT_WEBSITE_TOKEN'),
                        baseUrl: BASE_URL,
                    });
                };
            })(document, 'script');
        }
    }, []);

    return (
        <html lang="en">
            <head>
                <Script src="/__ENV.js" />

                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta name="theme-color" content="#000000" />
                <meta
                    httpEquiv="Content-Security-Policy"
                    content="default-src 'self' ;
                      img-src 'self'
                          *
                          data:
                      ;
                      script-src 'self' 'unsafe-inline' 'unsafe-eval'
                          blob:
                          https://orkg.org
                          https://*.orkg.org
                          https://support.tib.eu
                          https://tibhannover.gitlab.io
                          https://www.gstatic.com
                          https://platform.twitter.com
                          https://cdn.syndication.twimg.com
                          https://cdnjs.cloudflare.com
                          https://app.chatwoot.com
                      ;
                      style-src 'self' 'unsafe-inline'
                          https://orkg.org
                          https://*.orkg.org
                          https://maxcdn.bootstrapcdn.com
                          https://www.gstatic.com
                          https://platform.twitter.com
                          https://*.twimg.com
                      ;
                      font-src 'self'
                          data:
                          https://orkg.org
                          https://*.orkg.org
                          https://maxcdn.bootstrapcdn.com
                          https://cdnjs.cloudflare.com
                      ;
                      frame-src 'self'
                          https://orkg.org
                          https://*.orkg.org
                          https://av.tib.eu
                          http://av.tib.eu
                          https://platform.twitter.com
                          https://syndication.twitter.com
                          https://www.youtube.com
                          https://time.graphics
                          https://app.chatwoot.com
                          https://support.tib.eu
                      ;
                      connect-src 'self'
                          blob:
                          localhost:*
                          127.0.0.1:*
                          https://orkg.org
                          https://*.orkg.org
                          https://support.tib.eu
                          https://api.altmetric.com
                          https://doi.org
                          https://data.crosscite.org
                          https://secure.geonames.org
                          https://service.tib.eu
                          https://pub.orcid.org
                          https://api.semanticscholar.org
                          https://api.datacite.org
                          https://api.crossref.org
                          https://app.chatwoot.com
                          https://opencitations.net
                          https://*.wikidata.org
                          https://*.wikipedia.org/api/
                          https://dbpedia.org/sparql
                          https://api.unpaywall.org
                          https://raw.githubusercontent.com
                          https://fonts.gstatic.com
                          https://mastodon.social
                      ;"
                />

                <link rel="manifest" href="/manifest.json" />
                <link rel="shortcut icon" href="/favicon.ico" />

                {/* <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
                <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />  */}
                {/* <script src="%PUBLIC_URL%/__ENV.js"></script>
                <meta property="og:image" content="%PUBLIC_URL%/og_image.png" /> */}

                {/* <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" /> */}
                <title>Open Research Knowledge Graph</title>
                <meta property="og:image" content="/og_image.png" />
            </head>
            <body>
                <noscript> You need to enable JavaScript to run this app. </noscript>
                <StyledComponentsRegistry>
                    <DndProvider backend={HTML5Backend}>
                        <CookiesProvider>
                            <Provider store={store}>
                                <ThemeProvider theme={theme}>
                                    <MathJaxContext config={MATH_JAX_CONFIG}>
                                        <MatomoProvider value={matomoInstance}>
                                            {/* <Router basename={env('PUBLIC_URL')} history={history}> */}
                                            {/* <ScrollToTop> */}
                                            {/* <ErrorBoundary> */}
                                            <DefaultLayout>
                                                {showBrowserWarning && (
                                                    <Alert color="danger" style={alertStyle} className="text-center">
                                                        <strong>Outdated browser</strong> You are using Internet Explorer which is not supported.
                                                        Please upgrade your browser for the best experience
                                                    </Alert>
                                                )}
                                                {env('IS_TESTING_SERVER') === 'true' && (
                                                    <>
                                                        <Helmet>
                                                            <meta name="robots" content="noindex" />{' '}
                                                            {/* make sure search engines are not indexing our test server */}
                                                        </Helmet>
                                                        <Alert color="warning" style={alertStyle} className="text-center">
                                                            <strong>Warning:</strong> You are using a testing environment. Data you enter in the
                                                            system can be deleted without any notice.
                                                        </Alert>
                                                    </>
                                                )}
                                                {children}
                                            </DefaultLayout>
                                            {/* </ErrorBoundary> */}
                                            {/* </ScrollToTop> */}
                                            {/* </Router> */}
                                        </MatomoProvider>
                                    </MathJaxContext>
                                </ThemeProvider>
                            </Provider>
                        </CookiesProvider>
                    </DndProvider>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
};

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RootLayout;
