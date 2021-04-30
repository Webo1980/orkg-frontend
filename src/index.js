import 'assets/scss/DefaultLayout.scss'; // should be placed before App import
import 'fast-text-encoding/text';
import 'jspdf/dist/polyfills.es.js';
import Providers from 'Providers';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
import App from './App';
import rootReducer from './reducers/rootReducer';
import { unregister } from './registerServiceWorker';
import configureStore, { history } from './store';

// Extract Sass variables into a JS object
// eslint-disable-next-line import/no-webpack-loader-syntax
const theme = require('sass-extract-loader?{plugins: ["sass-extract-js"]}!./assets/scss/ThemeVariables.scss');
const store = configureStore();

const render = () => {
    ReactDOM.render(
        <Providers theme={theme} store={store}>
            <App history={history} />
        </Providers>,
        document.getElementById('root')
    );
};

render();
unregister();

// Hot reloading components and reducers
if (module.hot) {
    module.hot.accept('./App', () => {
        render();
    });

    module.hot.accept('./reducers/rootReducer', () => {
        store.replaceReducer(rootReducer(history));
    });
}
