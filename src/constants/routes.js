const routes = {
    HOME: '/',
    USER_SETTINGS: '/settings',
    USER_PROFILE: '/u/:userId',
    RESOURCES: '/resources',
    RESOURCE: '/resource/:id',
    ADD_RESOURCE: '/addResource',
    PROPERTIES: '/properties',
    PROPERTY: '/property/:id',
    ADD_PROPERTY: '/addProperty',
    CLASSES: '/classes',
    CLASS: '/class/:id',
    ADD_CLASS: '/addClass',
    TEMPLATES: '/templates',
    TEMPLATE: '/template/:id?',
    ORGANIZATIONS: '/organizations',
    OBSERVATORIES: '/observatories',
    ADD_ORGANIZATION: '/addOrganization',
    ORGANIZATION: '/organizations/:id',
    ADD_OBSERVATORY: '/organizations/:id/addObservatory',
    OBSERVATORY: '/observatory/:id',
    ADD_PAPER: {
        GENERAL_DATA: '/add-paper'
    },
    VIEW_PAPER: '/paper/:resourceId/:contributionId?',
    CONTRIBUTION: '/contribution/:id',
    COMPARISON_SHORTLINK: '/c/:shortCode',
    COMPARISON: '/comparison/:comparisonId?',
    COMPARISON_DIFF: '/comparison/diff/:oldId-:newId',
    PAPERS: '/papers',
    COMPARISONS: '/comparisons',
    VISUALIZATIONS: '/visualizations',
    VISUALIZATION: '/visualization/:id?',
    RESEARCH_PROBLEM: '/problem/:researchProblemId/:slug?',
    RESEARCH_FIELD: '/field/:researchFieldId/:slug?',
    RESEARCH_FIELDS: '/fields',
    VENUE_PAGE: '/venue/:venueId',
    AUTHOR_PAGE: '/author/:authorId',
    SEARCH: '/search/:searchTerm?',
    STATS: '/stats',
    DATA: '/data',
    CHANGELOG: '/changelog',
    FEATURED_COMPARISONS: '/featured-comparisons',
    PDF_TEXT_ANNOTATION: '/pdf-text-annotation',
    PDF_ANNOTATION: '/pdf-annotation',
    CSV_IMPORT: '/csv-import',
    BENCHMARKS: '/benchmarks',
    BENCHMARK: '/benchmark/:datasetId/problem/:problemId',
    SMART_REVIEW: '/smart-review/:id',
    SMART_REVIEWS: '/smart-reviews',
    USER_UNPUBLISHED_REVIEWS: '/user-unpublished-reviews',
    SMART_REVIEW_NEW: '/smart-review/new',
    SMART_REVIEW_DIFF: '/smart-review/diff/:oldId-:newId',
    TOOLS: '/tools',
    CONTRIBUTION_EDITOR: '/contribution-editor',
    ADD_COMPARISON: '/add-comparison',
    RELATED_PAPERS: '/related-papers/:slug/',
    /* Legacy routes */
    PREDICATES: '/predicates',
    PREDICATE: '/predicate/:id',
    TPDL: '/tpdl',
    EXPORT_DATA: '/export-data',
    PAGE: '/page/:url',
    ABOUT: '/about/:id?/:slug?',
    HELP_CENTER: '/help-center',
    HELP_CENTER_CATEGORY: '/help-center/category/:id',
    HELP_CENTER_ARTICLE: '/help-center/article/:id/:slug',
    HELP_CENTER_SEARCH: '/help-center/search/:searchQuery',
    CURATION_CALL: '/open-call-curation-grant',
    WEBINAR_MAY_11: '/webinar-may-11'
};
export default routes;
