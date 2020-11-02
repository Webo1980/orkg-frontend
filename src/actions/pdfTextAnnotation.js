import * as type from './types.js';
import { guid } from '../utils';
import md5 from 'md5';
import { getStatementsByPredicateAndLiteral, getStatementsBundleBySubject } from 'services/backend/statements';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { mapKeys } from 'lodash';

export const createAnnotation = annotation => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_CREATE_ANNOTATION,
        payload: {
            id: guid(),
            ...annotation
        }
    });
};

export const deleteAnnotation = annotationId => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_DELETE_ANNOTATION,
        payload: annotationId
    });
};

export const updateAnnotationText = payload => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_UPDATE_ANNOTATION,
        payload
    });
};

export const changeZoom = zoom => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_CHANGE_ZOOM,
        payload: {
            zoom
        }
    });
};

export const setSummaryFetched = summaryFetched => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_SUMMARY_FETCHED,
        payload: {
            summaryFetched
        }
    });
};

export const setShowHighlights = showHighlights => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_SHOW_HIGHLIGHTS,
        payload: {
            showHighlights
        }
    });
};

export const setPdfViewer = pdfViewer => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_PDF_VIEWER,
        payload: {
            pdfViewer
        }
    });
};

const toBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

export const uploadPdf = files => async dispatch => {
    if (files.length === 0) {
        return;
    }

    const pdf = files[0];
    const encodedPdf = await toBase64(files[0]);
    const documentHash = md5(encodedPdf);

    dispatch({
        type: type.PDF_TEXT_ANNOTATION_SET_PDF,
        payload: {
            pdf,
            encodedPdf,
            documentHash
        }
    });

    const findExistingAnnotations = await getStatementsByPredicateAndLiteral({
        literal: documentHash,
        predicateId: PREDICATES.DOCUMENT_HASH
    });

    // if no existing annotations found
    if (findExistingAnnotations.length === 0) {
        return;
    }

    const contributionId = findExistingAnnotations[0].subject.id;
    let contributionStatements = await getStatementsBundleBySubject({ id: contributionId });
    contributionStatements = contributionStatements.bundle;

    const annotationDict = {};
    const annotationIds = [];

    for (const { statement } of contributionStatements) {
        if (!(statement.subject.id in annotationDict)) {
            annotationDict[statement.subject.id] = {};
            if (statement.subject.classes.includes(CLASSES.SENTENCE)) {
                annotationIds.push(statement.subject.id);
                annotationDict[statement.subject.id].type = statement.subject.classes.find(_class => _class !== CLASSES.SENTENCE);
            }
        }

        // only rects should be an array, the rest are strings
        if (statement.predicate.id === PREDICATES.RECTS) {
            if (!(statement.predicate.id in annotationDict[statement.subject.id])) {
                annotationDict[statement.subject.id][statement.predicate.id] = [];
            }
            annotationDict[statement.subject.id][statement.predicate.id].push(statement.object.id);
        } else {
            // if literal select the label, otherwise select the resource ID
            let value = statement.object._class === 'literal' ? statement.object.label : statement.object.id;
            // parseFloats if the string contains a number
            value = statement.object._class === 'literal' && !isNaN(value) ? parseFloat(value) : value;
            annotationDict[statement.subject.id][statement.predicate.id] = value;
        }
    }

    for (const annotationId of annotationIds) {
        const annotation = annotationDict[annotationId];
        const type = annotation.type;
        const text = annotation[PREDICATES.HAS_CONTENT];
        const position = annotationDict[annotation[PREDICATES.POSITION]];
        const pageNumber = position[PREDICATES.PAGE_NUMBER];
        const boundingRectId = position[PREDICATES.BOUNDING_RECT];
        const boundingRect = mapKeys(annotationDict[boundingRectId], (v, k) => k.toLowerCase()); // keys to lowercase
        const rectIds = position[PREDICATES.RECTS];
        const rects = [];

        for (const rectId of rectIds) {
            rects.push(mapKeys(annotationDict[rectId], (v, k) => k.toLowerCase()));
        }

        const annotationObject = {
            content: {
                text
            },
            type,
            position: {
                pageNumber,
                boundingRect,
                rects
            }
        };

        dispatch(createAnnotation(annotationObject));
    }
};

export const discardChanges = () => dispatch => {
    dispatch({
        type: type.PDF_TEXT_ANNOTATION_RESET
    });
};
