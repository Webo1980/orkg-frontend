import * as type from 'actions/types';
import dotProp from 'dot-prop-immutable';
import assign from 'lodash/assign';
import { asyncLocalStorage } from 'utils';

const initialState = {
    researchProblems: {},
    comparison: {
        byId: {},
        allIds: []
    },
    paperResource: {
        id: '',
        label: '',
        created_at: null,
        classes: [],
        shared: 0,
        created_by: '00000000-0000-0000-0000-000000000000',
        observatory_id: '00000000-0000-0000-0000-000000000000',
        extraction_method: 'UNKNOWN',
        organization_id: '00000000-0000-0000-0000-000000000000'
    },
    authors: [],
    publicationMonth: {},
    publicationYear: {},
    doi: {},
    researchField: {},
    verified: false,
    publishedIn: {},
    url: {}
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.LOAD_PAPER: {
            const { payload } = action;

            return {
                ...state,
                ...payload
            };
        }

        case type.SET_RESEARCH_PROBLEMS: {
            const { payload } = action;

            const newState = dotProp.set(state, 'researchProblems', ids => ({
                ...ids,
                [payload.resourceId]: payload.researchProblems
            }));

            return {
                ...newState
            };
        }

        case type.SET_PAPER_AUTHORS: {
            const { payload } = action;

            return dotProp.set(state, 'authors', payload.authors);
        }

        case type.SET_PAPER_OBSERVATORY: {
            const { payload } = action;
            let newState = dotProp.set(state, 'paperResource.observatory_id', payload.observatory_id);
            newState = dotProp.set(newState, 'paperResource.organization_id', payload.organization_id);
            return {
                ...newState
            };
        }

        case type.UPDATE_RESEARCH_PROBLEMS: {
            const { payload } = action;

            return dotProp.set(state, `researchProblems.${payload.contributionId}`, payload.problemsArray);
        }

        case type.LOAD_COMPARISON_FROM_LOCAL_STORAGE: {
            const { payload } = action;
            const newComparison = payload;
            return {
                ...state,
                comparison: newComparison
            };
        }

        case type.ADD_TO_COMPARISON: {
            const { payload } = action;

            const comparisonContributions = assign(state.comparison.byId, {
                [payload.contributionId]: {
                    paperId: payload.contributionData.paperId,
                    paperTitle: payload.contributionData.paperTitle,
                    contributionTitle: payload.contributionData.contributionTitle
                }
            });
            const newComparison = {
                allIds: [...state.comparison.allIds, payload.contributionId],
                byId: comparisonContributions
            };
            asyncLocalStorage.setItem('comparison', JSON.stringify(newComparison));
            //cookies.set('comparison', newComparison, { path: process.env.PUBLIC_URL, maxAge: 604800 });
            return {
                ...state,
                comparison: newComparison
            };
        }

        case type.REMOVE_FROM_COMPARISON: {
            const { payload } = action;

            const valueIndex = dotProp.get(state, 'comparison.allIds').indexOf(payload.id);
            const newState = dotProp.delete(state, `comparison.allIds.${valueIndex}`);
            const newComparison = {
                allIds: newState.comparison.allIds,
                byId: dotProp.delete(state.comparison.byId, payload.id)
            };
            asyncLocalStorage.setItem('comparison', JSON.stringify(newComparison));
            //cookies.set('comparison', newComparison, { path: process.env.PUBLIC_URL, maxAge: 604800 });
            return {
                ...newState,
                comparison: newComparison
            };
        }

        default: {
            return state;
        }
    }
};
