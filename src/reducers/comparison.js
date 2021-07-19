import * as type from 'actions/types';
import dotProp from 'dot-prop-immutable';
import { DEFAULT_COMPARISON_METHOD } from 'constants/misc';
import { Cookies } from 'react-cookie';
const cookies = new Cookies();

const initialState = {
    object: {
        id: '',
        label: '',
        created_at: null,
        classes: [],
        shared: 0,
        created_by: '00000000-0000-0000-0000-000000000000',
        observatory_id: '00000000-0000-0000-0000-000000000000',
        extraction_method: 'UNKNOWN',
        organization_id: '00000000-0000-0000-0000-000000000000',
        authors: [],
        references: [],
        resources: [],
        figures: [],
        visualizations: [],
        contributions: [],
        researchField: null,
        hasPreviousVersion: null,
        doi: null,
        description: '',
        properties: ''
    },
    configuration: {
        transpose: false,
        comparisonType: DEFAULT_COMPARISON_METHOD,
        responseHash: null,
        contributionsList: [],
        predicatesList: [],
        fullWidth: cookies.get('useFullWidthForComparisonTable') === 'true' ? cookies.get('useFullWidthForComparisonTable') : false,
        viewDensity: cookies.get('viewDensityComparisonTable') ? cookies.get('viewDensityComparisonTable') : 'spacious'
    },
    properties: [],
    contributions: [],
    data: {},
    filterControlData: [],
    errors: [],
    matrixData: [],
    createdBy: null,
    provenance: null,
    shortLink: '',
    researchField: null,
    isLoadingMetadata: false,
    isFailedLoadingMetadata: false,
    isLoadingResult: true,
    isFailedLoadingResult: false
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case type.COMPARISON_SET_DATA: {
            const { payload } = action;
            const newState = dotProp.set(state, `data`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_PROPERTIES: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_CONTRIBUTIONS: {
            const { payload } = action;
            const newState = dotProp.set(state, `contributions`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_FILTER_CONTROL_DATA: {
            const { payload } = action;
            const newState = dotProp.set(state, `filterControlData`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_SHORT_LINK: {
            const { payload } = action;
            const newState = dotProp.set(state, `shortLink`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_LOADING_METADATA: {
            const { payload } = action;
            const newState = dotProp.set(state, `isLoadingMetadata`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_FAILED_LOADING_METADATA: {
            const { payload } = action;
            const newState = dotProp.set(state, `isFailedLoadingMetadata`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_ERRORS: {
            const { payload } = action;
            const newState = dotProp.set(state, `errors`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_LOADING_RESULT: {
            const { payload } = action;
            const newState = dotProp.set(state, `isLoadingResult`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_FAILED_LOADING_RESULT: {
            const { payload } = action;
            const newState = dotProp.set(state, `isFailedLoadingResult`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_PROVENANCE: {
            const { payload } = action;
            const newState = dotProp.set(state, `provenance`, payload);
            return {
                ...newState
            };
        }
        case type.COMPARISON_SET_CREATED_BY: {
            const { payload } = action;
            const newState = dotProp.set(state, `createdBy`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_MATRIX_DATA: {
            const { payload } = action;
            const newState = dotProp.set(state, `matrixData`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_VISUALIZATIONS: {
            const { payload } = action;
            const newState = dotProp.set(state, `object.visualizations`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_DOI: {
            const { payload } = action;
            const newState = dotProp.set(state, `object.doi`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_PREVIOUS_VERSION: {
            const { payload } = action;
            const newState = dotProp.set(state, `object.hasPreviousVersion`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_CONFIGURATION_ATTRIBUTE: {
            const { payload } = action;
            const newState = dotProp.set(state, `configuration.${payload.attribute}`, payload.value);
            return {
                ...newState
            };
        }

        case type.COMPARISON_SET_RESEARCH_FIELD: {
            const { payload } = action;
            const newState = dotProp.set(state, `object.researchField`, payload);
            return {
                ...newState
            };
        }

        case type.COMPARISON_CLEAR_COMPARISON_ID: {
            let newState = dotProp.set(state, `object.hasPreviousVersion`, {
                id: dotProp.get(state, 'object.id'),
                created_at: dotProp.get(state, 'object.created_at'),
                created_by: dotProp.get(state, 'object.created_by')
            });
            newState = dotProp.set(newState, `object.id`, null);
            newState = dotProp.set(newState, `object.visualizations`, []);
            newState = dotProp.set(newState, `object.doi`, null);
            return {
                ...newState
            };
        }
        case type.COMPARISON_SET_CONFIGURATION: {
            const { payload } = action;

            return {
                ...state,
                configuration: payload ?? {}
            };
        }

        case type.COMPARISON_SET_COMPARISON_OBJECT: {
            const { payload } = action;

            return {
                ...state,
                object: payload ?? {}
            };
        }

        case '@@router/LOCATION_CHANGE': {
            return {
                ...initialState
            };
        }

        default: {
            return state;
        }
    }
}
