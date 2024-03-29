/* eslint-disable react/prop-types */
import { lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ResourceDetails from 'pages/Resources/Resource';
import AddPaper from 'pages/AddPaper';
import AuthorPage from 'pages/AuthorPage';
import VenuePage from 'pages/VenuePage';
import AddResource from 'pages/Resources/AddResource';
import Comparison from 'pages/Comparisons/Comparison';
import ComparisonDiff from 'pages/Comparisons/ComparisonDiff';
import Home from 'pages/Home';
import Changelog from 'pages/Changelog/Changelog';
import NotFound from 'pages/NotFound';
import Papers from 'pages/Papers/Papers';
import Comparisons from 'pages/Comparisons/Comparisons';
import Visualizations from 'pages/Visualizations/Visualizations';
import Visualization from 'pages/Visualizations/Visualization';
import ClassDetails from 'pages/Classes/ClassDetails';
import Classes from 'pages/Classes/Classes';
import AddClass from 'pages/Classes/AddClass';
import Properties from 'pages/Properties/Properties';
import AddProperty from 'pages/Properties/AddProperty';
import PropertyDetails from 'pages/Properties/Property';
import Templates from 'pages/Templates/Templates';
import ImportSHACL from 'pages/Templates/ImportSHACL';
import Template from 'pages/Templates/Template';
import ROUTES from 'constants/routes';
import RedirectShortLinks from 'pages/RedirectShortLinks';
import ResearchField from 'pages/ResearchFields/ResearchField';
import ResearchFields from 'pages/ResearchFields/ResearchFields';
import Resources from 'pages/Resources/Resources';
import Organizations from 'pages/Organizations/Organizations';
import Observatories from 'pages/Observatories/Observatories';
import Organization from 'pages/Organizations/Organization';
import AddOrganization from 'pages/Organizations/AddOrganization';
import AddObservatory from 'pages/Observatories/AddObservatory';
import Observatory from 'pages/Observatories/Observatory';
import SearchResults from 'pages/Search';
import Stats from 'pages/Stats';
import UserSettings from 'pages/UserSettings';
import UserProfile from 'pages/UserProfile';
import Data from 'pages/Data';
import Contribution from 'pages/Contribution';
import CsvImport from 'pages/CsvImport';
import Review from 'pages/Reviews/Review';
import Reviews from 'pages/Reviews/Reviews';
import ReviewNew from 'pages/Reviews/ReviewNew';
import ReviewDiff from 'pages/Reviews/ReviewDiff';
import Tools from 'pages/Tools';
import AddComparison from 'pages/AddComparison';
import requireAuthentication from 'requireAuthentication';
import Benchmarks from 'pages/Benchmarks/Benchmarks';
import Benchmark from 'pages/Benchmarks/Benchmark';
import { reverse } from 'named-urls';
import ContributionEditor from 'pages/ContributionEditor';
import Page from 'pages/Page';
import About from 'pages/About';
import HelpCenter from 'pages/HelpCenter/HelpCenter';
import HelpCenterCategory from 'pages/HelpCenter/HelpCenterCategory';
import HelpCenterArticle from 'pages/HelpCenter/HelpCenterArticle';
import HelpCenterSearch from 'pages/HelpCenter/HelpCenterSearch';
import WebinarMay11 from 'pages/WebinarMay11';
import CheckPaperVersion from 'pages/Papers/CheckPaperVersion';
import Lists from 'pages/Lists/Lists';
import ListNew from 'pages/Lists/ListNew';
import List from 'pages/Lists/List';
import ListDiff from 'pages/Lists/ListDiff';
import ContentTypeNew from 'pages/ContentType/ContentTypeNew';
import ContentType from 'pages/ContentType/ContentType';
import ContentTypes from 'pages/ContentType/ContentTypes';
import Diagrams from 'pages/Diagrams/Diagrams';
import Diagram from 'pages/Diagrams/Diagram';
import ConferenceDetails from 'pages/Conferences/ConferenceDetails';
import AddConference from 'pages/Conferences/AddConference';
import ResearchProblem from 'pages/ResearchProblem';
import AuthorLiteral from 'pages/AuthorLiteral';
import TemplateNew from 'pages/Templates/TemplateNew';

// use lazy loading of pages that contain large dependencies
// run "npm run analyze" to ensure the listed dependencies are not loaded elsewhere and thus end up in the bundle
const PdfTextAnnotation = lazy(() => import('pages/PdfTextAnnotation')); // for dependency "react-pdf-highlighter" ~1.16MB
const PdfAnnotation = lazy(() => import('pages/PdfAnnotation')); // for dependency "handsontable" ~887.4KB
const FeaturedComparisons = lazy(() => import('pages/FeaturedComparisons')); // for dependency @fontawesome/free-solid-svg-icons used to show icons

const routes = [
    {
        path: ROUTES.HOME,
        element: Home,
    },
    {
        path: ROUTES.RESOURCES,
        element: Resources,
    },
    {
        path: ROUTES.RESOURCE,
        element: ResourceDetails,
    },
    {
        path: ROUTES.RESOURCE_TABS,
        element: ResourceDetails,
    },
    {
        path: ROUTES.ADD_RESOURCE,
        element: requireAuthentication(AddResource),
    },
    {
        path: ROUTES.PROPERTIES,
        element: Properties,
    },
    {
        path: ROUTES.PROPERTY,
        element: PropertyDetails,
    },
    {
        path: ROUTES.ADD_PROPERTY,
        element: requireAuthentication(AddProperty),
    },
    {
        path: ROUTES.CLASSES,
        element: Classes,
    },
    {
        path: ROUTES.CLASS,
        element: ClassDetails,
    },
    {
        path: ROUTES.CLASS_TABS,
        element: ClassDetails,
    },
    {
        path: ROUTES.ADD_CLASS,
        element: requireAuthentication(AddClass),
    },
    {
        path: ROUTES.TEMPLATES,
        element: Templates,
    },
    {
        path: ROUTES.IMPORT_SHACL,
        element: requireAuthentication(ImportSHACL),
    },
    {
        path: ROUTES.TEMPLATE,
        element: Template,
    },
    {
        path: ROUTES.TEMPLATE_TABS,
        element: Template,
    },
    {
        path: ROUTES.ADD_TEMPLATE,
        element: TemplateNew,
    },
    {
        path: ROUTES.USER_SETTINGS,
        element: requireAuthentication(UserSettings),
    },
    {
        path: ROUTES.USER_SETTINGS_DEFAULT,
        element: requireAuthentication(UserSettings),
    },
    {
        path: ROUTES.USER_PROFILE,
        element: UserProfile,
    },
    {
        path: ROUTES.USER_PROFILE_TABS,
        element: UserProfile,
    },
    {
        path: ROUTES.ADD_PAPER,
        element: AddPaper,
    },
    {
        /* TODO: slug for the paper title */
        path: ROUTES.VIEW_PAPER_CONTRIBUTION,
        element: CheckPaperVersion,
    },
    {
        path: ROUTES.VIEW_PAPER,
        element: CheckPaperVersion,
    },
    {
        path: ROUTES.COMPARISON_DIFF,
        element: ComparisonDiff,
    },
    {
        path: ROUTES.COMPARISON_SHORTLINK,
        element: RedirectShortLinks,
    },
    {
        path: ROUTES.COMPARISON,
        element: Comparison,
    },
    {
        path: ROUTES.COMPARISON_NOT_PUBLISHED,
        element: Comparison,
    },
    {
        path: ROUTES.ORGANIZATIONS,
        element: Organizations,
    },
    {
        path: ROUTES.OBSERVATORIES,
        element: Observatories,
    },
    {
        path: ROUTES.OBSERVATORIES_RESEARCH_FIELD,
        element: Observatories,
    },
    {
        path: ROUTES.PAPERS,
        element: Papers,
    },
    {
        path: ROUTES.COMPARISONS,
        element: Comparisons,
    },

    {
        path: ROUTES.VISUALIZATIONS,
        element: Visualizations,
    },
    {
        path: ROUTES.VISUALIZATION,
        element: Visualization,
    },
    {
        path: ROUTES.RESEARCH_PROBLEM,
        element: ResearchProblem,
    },
    {
        path: ROUTES.RESEARCH_PROBLEM_NO_SLUG,
        element: ResearchProblem,
    },
    {
        path: ROUTES.RESEARCH_FIELD,
        element: ResearchField,
    },
    {
        path: ROUTES.RESEARCH_FIELD_NO_SLUG,
        element: ResearchField,
    },
    {
        path: ROUTES.RESEARCH_FIELDS,
        element: ResearchFields,
    },
    {
        path: ROUTES.VENUE_PAGE,
        element: VenuePage,
    },
    {
        path: ROUTES.AUTHOR_PAGE,
        element: AuthorPage,
    },
    {
        path: ROUTES.AUTHOR_LITERAL,
        element: AuthorLiteral,
    },
    {
        path: ROUTES.CHANGELOG,
        element: Changelog,
    },
    {
        path: ROUTES.SEARCH,
        element: SearchResults,
    },
    {
        path: ROUTES.STATS,
        element: Stats,
    },
    /* Legacy routes, only used for debugging now */
    {
        path: ROUTES.FEATURED_COMPARISONS,
        element: FeaturedComparisons,
    },
    {
        path: ROUTES.ORGANIZATION,
        element: Organization,
    },
    {
        path: ROUTES.ADD_ORGANIZATION,
        element: requireAuthentication(AddOrganization),
    },
    {
        path: ROUTES.ADD_OBSERVATORY,
        element: requireAuthentication(AddObservatory),
    },
    {
        path: ROUTES.OBSERVATORY,
        element: Observatory,
    },
    {
        path: ROUTES.PDF_TEXT_ANNOTATION,
        element: PdfTextAnnotation,
    },
    {
        path: ROUTES.TPDL,
        element: () => <Navigate to="/" />,
    },
    {
        path: ROUTES.PDF_ANNOTATION,
        element: requireAuthentication(PdfAnnotation),
    },
    {
        path: ROUTES.CONTRIBUTION,
        element: Contribution,
    },
    {
        path: ROUTES.EXPORT_DATA,
        element: () => <Navigate to={{ pathname: reverse(ROUTES.DATA), state: { status: 301 } }} />,
    },
    {
        path: ROUTES.DATA,
        element: Data,
    },
    {
        path: ROUTES.CSV_IMPORT,
        element: requireAuthentication(CsvImport),
    },
    {
        path: ROUTES.BENCHMARKS,
        element: Benchmarks,
    },
    {
        path: ROUTES.BENCHMARK,
        element: Benchmark,
    },
    {
        path: ROUTES.REVIEW_NEW,
        element: requireAuthentication(ReviewNew),
    },
    {
        path: ROUTES.REVIEW_DIFF,
        element: ReviewDiff,
    },
    {
        path: ROUTES.REVIEW,
        element: Review,
    },
    {
        path: ROUTES.REVIEWS,
        element: Reviews,
    },
    {
        path: ROUTES.CONTRIBUTION_EDITOR,
        element: requireAuthentication(ContributionEditor),
    },
    {
        path: ROUTES.ADD_COMPARISON,
        element: AddComparison,
    },
    {
        path: ROUTES.TOOLS,
        element: Tools,
    },
    {
        path: ROUTES.PAGE,
        element: Page,
    },
    {
        path: ROUTES.ABOUT,
        element: About,
    },
    {
        path: ROUTES.ABOUT_NO_SLUG,
        element: About,
    },
    {
        path: ROUTES.ABOUT_NO_SLUG_ID,
        element: About,
    },
    {
        path: ROUTES.HELP_CENTER_CATEGORY,
        element: HelpCenterCategory,
    },
    {
        path: ROUTES.HELP_CENTER_ARTICLE,
        element: HelpCenterArticle,
    },
    {
        path: ROUTES.HELP_CENTER_SEARCH,
        element: HelpCenterSearch,
    },
    {
        path: ROUTES.LISTS,
        element: Lists,
    },
    {
        path: ROUTES.LIST_NEW,
        element: ListNew,
    },
    {
        path: ROUTES.LIST_DIFF,
        element: ListDiff,
    },
    {
        path: ROUTES.LIST,
        element: List,
    },
    {
        path: ROUTES.LIST_EMBED,
        element: List,
    },
    // redirect legacy route
    {
        path: ROUTES.CURATION_CALL,
        element: () => {
            window.location.replace('https://www.orkg.org/about/28/Curation_Grants');
            return null;
        },
    },
    {
        path: ROUTES.HELP_CENTER,
        element: HelpCenter,
    },
    {
        path: ROUTES.WEBINAR_MAY_11,
        element: WebinarMay11,
    },
    {
        path: ROUTES.USER_UNPUBLISHED_REVIEWS,
        element: () => <Navigate to={{ pathname: reverse(ROUTES.USER_SETTINGS, { tab: 'draft-reviews' }), state: { status: 301 } }} />,
    },
    {
        path: ROUTES.CONTENT_TYPE_NEW,
        element: ContentTypeNew,
    },
    {
        path: ROUTES.CONTENT_TYPE_NEW_NO_TYPE,
        element: ContentTypeNew,
    },
    {
        path: ROUTES.CONTENT_TYPE,
        element: ContentType,
    },
    {
        path: ROUTES.CONTENT_TYPES,
        element: ContentTypes,
    },
    {
        path: ROUTES.DIAGRAMS,
        element: Diagrams,
    },
    {
        path: ROUTES.DIAGRAM,
        element: Diagram,
    },
    {
        path: ROUTES.NEW_DIAGRAM,
        element: Diagram,
    },
    {
        path: ROUTES.ADD_EVENT,
        element: requireAuthentication(AddConference),
    },
    {
        path: ROUTES.EVENT_SERIES,
        element: ConferenceDetails,
    },
];

const legacyRoutes = [
    {
        path: ROUTES.SMART_REVIEW_NEW,
        element: () => <Navigate to={ROUTES.REVIEW_NEW} replace />,
    },
    {
        path: ROUTES.SMART_REVIEW_DIFF,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { oldId, newId } = useParams();
            return <Navigate to={reverse(ROUTES.REVIEW_DIFF, { oldId, newId })} replace />;
        },
    },
    {
        path: ROUTES.SMART_REVIEW,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { id } = useParams();
            return <Navigate to={reverse(ROUTES.REVIEW, { id })} replace />;
        },
    },
    {
        path: ROUTES.SMART_REVIEWS,
        element: () => <Navigate to={ROUTES.REVIEWS} replace />,
    },
    {
        path: ROUTES.LITERATURE_LISTS,
        element: () => <Navigate to={ROUTES.LISTS} replace />,
    },
    {
        path: ROUTES.LITERATURE_LIST,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { id } = useParams();
            return <Navigate to={reverse(ROUTES.LIST, { id })} replace />;
        },
    },
    {
        path: ROUTES.LITERATURE_LIST_EMBED,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { id, embed } = useParams();
            return <Navigate to={reverse(ROUTES.LIST_EMBED, { id, embed })} replace />;
        },
    },
    {
        path: ROUTES.LITERATURE_LIST_NEW,
        element: () => <Navigate to={ROUTES.LIST_NEW} replace />,
    },
    {
        path: ROUTES.LITERATURE_LIST_DIFF,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { oldId, newId } = useParams();
            return <Navigate to={reverse(ROUTES.LIST_DIFF, { oldId, newId })} replace />;
        },
    },
];

const allRoutes = [
    ...routes,
    ...legacyRoutes,
    // NotFound must be the last route
    {
        path: '*',
        element: NotFound,
    },
];

export default allRoutes;
