const routes = {
    HOME: '/',
    USER_SETTINGS: '/settings/:tab',
    USER_SETTINGS_DEFAULT: '/settings',
    USER_PROFILE: '/u/:userId',
    USER_PROFILE_TABS: '/u/:userId/:activeTab',
    RESOURCES: '/resources',
    RESOURCE: '/resource/:id',
    RESOURCE_TABS: '/resource/:id/:activeTab',
    ADD_RESOURCE: '/addResource',
    PROPERTIES: '/properties',
    PROPERTY: '/property/:id',
    ADD_PROPERTY: '/addProperty',
    CLASSES: '/classes',
    CLASS: '/class/:id',
    CLASS_TABS: '/class/:id/:activeTab',
    ADD_CLASS: '/addClass',
    TEMPLATES: '/templates',
    TEMPLATE: '/template/:id',
    TEMPLATE_TABS: '/template/:id/:activeTab',
    ADD_TEMPLATE: '/template/',
    ORGANIZATIONS: '/organizations/:type',
    OBSERVATORIES: '/observatories',
    ADD_ORGANIZATION: '/addOrganization/:type',
    ORGANIZATION: '/organization/:type/:id',
    CONFERENCE: '/conference/:id',
    EVENT: '/event/:id',
    ADD_EVENT: '/organizations/:id/addEvent',
    EVENT_SERIES: '/event-series/:id',
    ADD_OBSERVATORY: '/organizations/:id/addObservatory',
    OBSERVATORY: '/observatory/:id',
    ADD_PAPER: {
        GENERAL_DATA: '/add-paper',
    },
    VIEW_PAPER: '/paper/:resourceId',
    VIEW_PAPER_CONTRIBUTION: '/paper/:resourceId/:contributionId',
    CONTRIBUTION: '/contribution/:id',
    COMPARISON_SHORTLINK: '/c/:shortCode',
    COMPARISON: '/comparison/:comparisonId/',
    COMPARISON_NOT_PUBLISHED: '/comparison/',
    COMPARISON_DIFF: '/comparison/diff/:oldId-:newId',
    PAPERS: '/papers',
    COMPARISONS: '/comparisons',
    VISUALIZATIONS: '/visualizations',
    VISUALIZATION: '/visualization/:id',
    RESEARCH_PROBLEM: '/problem/:researchProblemId/:slug',
    RESEARCH_PROBLEM_NO_SLUG: '/problem/:researchProblemId',
    RESEARCH_FIELD: '/field/:researchFieldId/:slug',
    RESEARCH_FIELD_NO_SLUG: '/field/:researchFieldId',
    RESEARCH_FIELDS: '/fields',
    VENUE_PAGE: '/venue/:venueId',
    AUTHOR_PAGE: '/author/:authorId',
    AUTHOR_LITERAL: '/author-literal/:authorString',
    SEARCH: '/search/:searchTerm',
    STATS: '/stats',
    DATA: '/data',
    CHANGELOG: '/changelog',
    FEATURED_COMPARISONS: '/featured-comparisons',
    PDF_TEXT_ANNOTATION: '/pdf-text-annotation',
    PDF_ANNOTATION: '/pdf-annotation',
    CSV_IMPORT: '/csv-import',
    BENCHMARKS: '/benchmarks',
    BENCHMARK: '/benchmark/:datasetId/problem/:problemId',
    REVIEW: '/review/:id',
    REVIEWS: '/reviews',
    REVIEW_NEW: '/review/new',
    REVIEW_DIFF: '/review/diff/:oldId-:newId',
    TOOLS: '/tools',
    CONTRIBUTION_EDITOR: '/contribution-editor',
    ADD_COMPARISON: '/add-comparison',
    /* Legacy routes */
    PREDICATES: '/predicates',
    PREDICATE: '/predicate/:id',
    TPDL: '/tpdl',
    EXPORT_DATA: '/export-data',
    PAGE: '/page/:url',
    ABOUT: '/about/:id/:slug',
    ABOUT_NO_SLUG: '/about/:id',
    ABOUT_NO_SLUG_ID: '/about/',
    HELP_CENTER: '/help-center',
    HELP_CENTER_CATEGORY: '/help-center/category/:id',
    HELP_CENTER_ARTICLE: '/help-center/article/:id/:slug',
    HELP_CENTER_SEARCH: '/help-center/search/:searchQuery',
    CURATION_CALL: '/open-call-curation-grant',
    WEBINAR_MAY_11: '/webinar-may-11',
    LISTS: '/lists',
    LIST: '/list/:id',
    LIST_EMBED: '/list/:id/:embed',
    LIST_NEW: '/list/new',
    LIST_DIFF: '/list/diff/:oldId-:newId',
    CONTENT_TYPE_NEW: '/content-type/:type/new',
    CONTENT_TYPE_NEW_NO_TYPE: '/content-type/new',
    CONTENT_TYPE: '/content-type/:type/:id/:mode',
    CONTENT_TYPE_NO_MODE: '/content-type/:type/:id',
    CONTENT_TYPES: '/content-type/:type',
    DIAGRAMS: '/diagrams',
    DIAGRAM: '/diagram/:id',
    NEW_DIAGRAM: '/diagram/',
};
/**
 * Legacy routes are used to redirect old URLs to new ones
 */
const legacyRoutes = {
    SMART_REVIEW: '/smart-review/:id',
    SMART_REVIEWS: '/smart-reviews',
    USER_UNPUBLISHED_REVIEWS: '/user-unpublished-reviews',
    SMART_REVIEW_NEW: '/smart-review/new',
    SMART_REVIEW_DIFF: '/smart-review/diff/:oldId-:newId',
    LITERATURE_LISTS: '/literature-lists',
    LITERATURE_LIST: '/literature-list/:id/',
    LITERATURE_LIST_EMBED: '/literature-list/:id/:embed',
    LITERATURE_LIST_NEW: '/literature-list/new',
    LITERATURE_LIST_DIFF: '/literature-list/diff/:oldId-:newId',
};
const allRoutes = { ...routes, ...legacyRoutes };

export default allRoutes;
