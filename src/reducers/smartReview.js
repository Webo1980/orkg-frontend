import * as type from 'actions/types';
import { match } from 'path-to-regexp';
import dotProp from 'dot-prop-immutable';
import ROUTES from 'constants/routes';

const initialState = {
    articleId: null,
    paper: {},
    authorResources: [],
    contributionId: 0,
    sections: [],
    versions: [],
    comparisons: {},
    researchField: {},
    isLoading: false,
    isEditing: false,
    isPublished: false,
    isOpenHistoryModal: false,
    references: [],
    usedReferences: {},
    statements: []
};

const smartReview = (state = initialState, action) => {
    switch (action.type) {
        case type.ARTICLE_WRITER_LOAD: {
            const {
                articleId,
                paper,
                authorResources,
                sections,
                contributionId,
                isPublished,
                versions,
                statements,
                researchField,
                contributors,
                references
            } = action.payload;

            return {
                ...state,
                articleId,
                contributionId,
                paper,
                authorResources,
                sections,
                isPublished,
                versions,
                statements,
                researchField,
                contributors,
                references
            };
        }

        case type.ARTICLE_WRITER_SET_IS_LOADING: {
            const { isLoading } = action;

            return {
                ...state,
                isLoading
            };
        }

        case type.ARTICLE_WRITER_SET_IS_EDITING: {
            const { isEditing } = action;

            return {
                ...state,
                isEditing
            };
        }

        case type.ARTICLE_WRITER_UPDATE_TITLE: {
            const { title } = action;
            return dotProp.set(state, `paper.title`, title);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_TITLE: {
            const { sectionId, title } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.title.label`, title);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_MARKDOWN: {
            const { id, markdown } = action.payload;
            const index = state.sections.findIndex(section => section.markdown && section.markdown.id === id);
            return dotProp.set(state, `sections.${index}.markdown.label`, markdown);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_LINK: {
            const { id, label, objectId } = action.payload;
            const index = state.sections.findIndex(section => section?.id === id);
            let newState;
            newState = dotProp.set(state, `sections.${index}.contentLink.objectId`, objectId);
            newState = dotProp.set(newState, `sections.${index}.contentLink.label`, label);
            return newState;
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_TYPE: {
            const { sectionId, sectionType } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.type.id`, sectionType);
        }

        case type.ARTICLE_WRITER_CREATE_SECTION: {
            const { afterIndex, sectionId, markdownId, typeId } = action.payload;

            return {
                ...state,
                sections: [
                    ...state.sections.slice(0, afterIndex),
                    {
                        id: sectionId,
                        title: {
                            id: sectionId,
                            label: ''
                        },
                        type: {
                            id: typeId
                        },
                        markdown: markdownId
                            ? {
                                  id: markdownId,
                                  label: ''
                              }
                            : undefined,
                        dataTable: {
                            entities: [],
                            properties: []
                        }
                    },
                    ...state.sections.slice(afterIndex)
                ]
            };
        }

        case type.ARTICLE_WRITER_UPDATE_AUTHORS: {
            const { authorResources } = action;

            return {
                ...state,
                authorResources
            };
        }

        case type.ARTICLE_WRITER_DELETE_SECTION: {
            const { id } = action.payload;
            const index = state.sections.findIndex(section => section.id === id);
            return dotProp.delete(state, `sections.${index}`);
        }

        case type.ARTICLE_WRITER_SORT_SECTIONS: {
            const { sections } = action.payload;

            return {
                ...state,
                sections
            };
        }

        case type.ARTICLE_WRITER_TOGGLE_OPEN_HISTORY_MODAL: {
            return {
                ...state,
                isOpenHistoryModal: !state.isOpenHistoryModal
            };
        }

        case type.ARTICLE_WRITER_SET_RESEARCH_FIELD: {
            const { researchField } = action.payload;

            return {
                ...state,
                researchField
            };
        }

        case type.ARTICLE_WRITER_SET_VERSIONS: {
            const { versions } = action.payload;

            return {
                ...state,
                versions
            };
        }

        case type.ARTICLE_WRITER_SET_COMPARISON_DATA: {
            const { id, data } = action.payload;

            return dotProp.set(state, `comparisons.${id}`, data);
        }

        case type.ARTICLE_WRITER_UPDATE_DATA_TABLE: {
            const { sectionId, dataTable } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.dataTable`, {
                ...state.sections[index].dataTable,
                ...dataTable
            });
        }

        case type.ARTICLE_WRITER_SET_DATA_TABLE_STATEMENTS: {
            const { id, sectionId, statements } = action.payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            if (sectionIndex === -1) {
                return state;
            }
            const dataTableIndex = state.sections[sectionIndex]?.dataTable?.entities?.findIndex(entity => entity.id === id);

            if (dataTableIndex === -1) {
                return state;
            }

            return dotProp.set(state, `sections.${sectionIndex}.dataTable.entities.${dataTableIndex}`, {
                ...state.sections[sectionIndex].dataTable.entities[dataTableIndex],
                statements
            });
        }

        case type.ARTICLE_WRITER_REFERENCE_ADD: {
            const { reference } = action.payload;
            return {
                ...state,
                references: [...state.references, reference]
            };
        }

        case type.ARTICLE_WRITER_REFERENCE_REMOVE: {
            const { statementId } = action.payload;
            return {
                ...state,
                references: state.references.filter(reference => reference.statementId !== statementId)
            };
        }

        case type.ARTICLE_WRITER_REFERENCE_UPDATE: {
            const { literalId, bibtex, parsedReference } = action.payload;
            return {
                ...state,
                references: state.references.map(reference =>
                    reference.literal.id === literalId
                        ? { ...reference, literal: { ...reference.literal, label: bibtex }, parsedReference }
                        : reference
                )
            };
        }

        case type.ARTICLE_WRITER_SET_USED_REFERENCES: {
            const { references, sectionId } = action.payload;

            return {
                ...state,
                usedReferences: {
                    ...state.usedReferences,
                    [sectionId]: references
                }
            };
        }

        case '@@router/LOCATION_CHANGE': {
            const matchSmartReview = match(ROUTES.SMART_REVIEW);
            const parsed_payload = matchSmartReview(action.payload.location.pathname);
            if (parsed_payload && parsed_payload.params?.id === state.articleId) {
                // when it's the same review  (just the hash changed) do not init
                return state;
            }
            return {
                ...initialState
            };
        }

        default: {
            return state;
        }
    }
};

export default smartReview;
