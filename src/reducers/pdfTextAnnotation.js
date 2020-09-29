import * as type from '../actions/types';

const initialState = {
    annotations: [],
    pdf: null,
    encodedPdf: null,
    zoom: 1.2,
    showHighlights: false,
    summaryFetched: false,
    pdfViewer: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.PDF_TEXT_ANNOTATION_CREATE_ANNOTATION: {
            const { payload } = action;

            return {
                ...state,
                annotations: [...state.annotations, payload]
            };
        }

        case type.PDF_TEXT_ANNOTATION_DELETE_ANNOTATION: {
            const { payload } = action;

            return {
                ...state,
                annotations: [...state.annotations.filter(annotation => annotation.id !== payload)]
            };
        }

        case type.PDF_TEXT_ANNOTATION_UPDATE_ANNOTATION: {
            const { payload } = action;

            return {
                ...state,
                annotations: [
                    ...state.annotations.map(annotation => {
                        if (annotation.id === payload.id) {
                            return {
                                ...annotation,
                                content: {
                                    text: payload.text
                                }
                            };
                        }
                        return annotation;
                    })
                ]
            };
        }

        case type.PDF_TEXT_ANNOTATION_SET_PDF: {
            const { payload } = action;

            return {
                ...state,
                pdf: payload.pdf,
                encodedPdf: payload.encodedPdf
            };
        }

        case type.PDF_TEXT_ANNOTATION_CHANGE_ZOOM: {
            const { payload } = action;

            return {
                ...state,
                zoom: payload.zoom
            };
        }

        case type.PDF_TEXT_ANNOTATION_SET_SHOW_HIGHLIGHTS: {
            const { payload } = action;

            return {
                ...state,
                showHighlights: payload.showHighlights
            };
        }

        case type.PDF_TEXT_ANNOTATION_SET_SUMMARY_FETCHED: {
            const { payload } = action;

            return {
                ...state,
                summaryFetched: payload.summaryFetched
            };
        }

        case type.PDF_TEXT_ANNOTATION_SET_PDF_VIEWER: {
            const { payload } = action;

            return {
                ...state,
                pdfViewer: payload.pdfViewer
            };
        }

        case type.PDF_TEXT_ANNOTATION_RESET: {
            return initialState;
        }

        default: {
            return state;
        }
    }
};