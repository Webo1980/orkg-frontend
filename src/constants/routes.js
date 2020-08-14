// import { include } from 'named-urls'

export default {
    HOME: '/',
    SIGNOUT: '/signout',
    USER_SETTINGS: '/settings',
    USER_PROFILE: '/u/:userId',
    RESOURCES: '/resources',
    RESOURCE: '/resource/:id',
    ADD_RESOURCE: '/addResource',
    PREDICATES: '/predicates',
    PREDICATE: '/predicate/:id',
    CLASSES: '/classes',
    CLASS: '/class/:id',
    CONTRIBUTION_TEMPLATES: '/templates',
    CONTRIBUTION_TEMPLATE: '/template/:id?',
    ORGANIZATIONS: '/organizations',
    OBSERVATORIES: '/observatories',
    ADD_ORGANIZATION: '/addOrganization',
    ORGANIZATION: '/organizations/:id',
    ADD_OBSERVATORY: '/organizations/:id/addObservatory',
    ORGANIZATION_OBSERVATORIES: '/organizations/:id/observatories',
    OBSERVATORY: '/observatory/:id',
    ADD_PAPER: {
        GENERAL_DATA: '/add-paper'
    },
    VIEW_PAPER: '/paper/:resourceId/:contributionId?',
    COMPARISON_SHORTLINK: '/c/:shortCode',
    COMPARISON: '/comparison/:comparisonId?',
    PAPERS: '/papers',
    COMPARISONS: '/comparisons',
    RESEARCH_PROBLEM: '/problem/:researchProblemId',
    RESEARCH_FIELD: '/field/:researchFieldId',
    VENUE_PAGE: '/venue/:venueId',
    AUTHOR_PAGE: '/author/:authorId',
    LICENSE: '/license',
    /* Legacy routes, only used for debugging now */
    SEARCH: '/search/:searchTerm?',
    TPDL: '/tpdl',
    STATS: '/stats',
    CHANGELOG: '/changelog',
    FEATURED_COMPARISONS: '/featured-comparisons',
    PDF_ANNOTATION: '/pdf-annotation'
};
