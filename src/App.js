import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from './routes.config';
import DefaultLayout from './components/Layout/DefaultLayout';
import './assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ConnectedRouter } from 'connected-react-router';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { detect } from 'detect-browser';
import ScrollToTop from './components/ScrollToTop';
import MetaTags from 'react-meta-tags';
import { Alert } from 'reactstrap';

class App extends Component {
    constructor(props) {
        super(props);

        const browser = detect();

        this.state = {
            showBrowserWarning: false
        };

        if (browser && browser.name === 'ie') {
            this.state.showBrowserWarning = true;
        }
    }

    render() {
        const alertStyle = { borderRadius: '0', marginTop: '-30px', marginBottom: '30px' };

        return (
            <ConnectedRouter history={this.props.history}>
                <ScrollToTop>
                    <DefaultLayout>
                        {this.state.showBrowserWarning && (
                            <Alert color="danger" style={alertStyle} className="text-center">
                                <strong>Outdated browser</strong> You are using Internet Explorer which is not supported. Please upgrade your browser
                                for the best experience
                            </Alert>
                        )}
                        {process.env.REACT_APP_IS_TESTING_SERVER === 'true' && (
                            <>
                                <MetaTags>
                                    <meta name="robots" content="noindex" /> {/* make sure search engines are not indexing our test server */}
                                </MetaTags>
                                <Alert color="warning" style={alertStyle} className="text-center">
                                    <strong>Warning:</strong> You are using a testing environment. Data you enter in the system can be deleted without
                                    any notice.
                                </Alert>
                            </>
                        )}
                        <Switch>{renderRoutes(routes)}</Switch>
                    </DefaultLayout>
                </ScrollToTop>
            </ConnectedRouter>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

export default withCookies(App);
