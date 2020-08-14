import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import addPaper from './addPaper';
import auth from './auth';
import statementBrowser from './statementBrowser';
import statementBrowserStore from './statementBrowserStore';
import viewPaper from './viewPaper';
import pdfAnnotation from './pdfAnnotation';
import addTemplate from './addTemplate';

export default history =>
    combineReducers({
        router: history ? connectRouter(history) : null,
        addPaper,
        viewPaper,
        statementBrowser,
        statementBrowserStore,
        pdfAnnotation,
        auth,
        addTemplate
    });
