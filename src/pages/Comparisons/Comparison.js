import { useEffect } from 'react';
import { Alert, Container } from 'reactstrap';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from 'components/Comparison/Comparison';
import ProvenanceBox from 'components/Comparison/ComparisonFooter/ProvenanceBox/ProvenanceBox';
import ComparisonMetaData from 'components/Comparison/ComparisonHeader/ComparisonMetaData';
import DataSources from 'components/Comparison/ComparisonFooter/DataSources';
import { ContainerAnimated } from 'components/Comparison/styled';
import useComparison from 'components/Comparison/hooks/useComparison';
import PreviewVisualizationComparison from 'components/Comparison/ComparisonCarousel/ComparisonCarousel';
import ComparisonHeaderMenu from 'components/Comparison/ComparisonHeader/ComparisonHeaderMenu';
import AppliedFilters from 'components/Comparison/ComparisonHeader/AppliedFilters';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { setConfigurationAttribute } from 'slices/comparisonSlice';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import { areAllRulesEmpty } from 'components/Comparison/Filters/helpers';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';

const Comparison = () => {
    const { comparisonId } = useParams();
    const { comparisonResource, navigateToNewURL } = useComparison({ id: comparisonId });
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);
    const isFailedLoadingResult = useSelector(state => state.comparison.isFailedLoadingResult);
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const fullWidth = useSelector(state => state.comparison.configuration.fullWidth);
    const isEditing = useSelector(state => state.comparison.isEditing);
    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 100px)' } : {};
    const [cookies] = useCookies(['useFullWidthForComparisonTable']);
    const isPublished = !!comparisonResource.id;
    const filterControlData = useSelector(state => state.comparison.filterControlData);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);

    const dispatch = useDispatch();

    useEffect(() => {
        if (comparisonResource?.label) {
            document.title = `${comparisonResource.label} - Comparison - ORKG`;
        }
        // if the comparison has more than 3 contributions, and the cookie is not set, make the table full width
        if (!cookies.useFullWidthForComparisonTable && !fullWidth && contributionsList.length > 3) {
            dispatch(setConfigurationAttribute({ attribute: 'fullWidth', value: true }));
        }
    }, [comparisonResource, contributionsList.length, cookies, dispatch, fullWidth]);

    return (
        <div>
            <ComparisonHeaderMenu navigateToNewURL={navigateToNewURL} />

            {(comparisonResource?.id || areAllRulesEmpty(filterControlData)) && (
                <Container id="description" className="box rounded clearfix position-relative mb-4 px-5">
                    <ComparisonMetaData />

                    {!isLoadingResult && contributionsList.length > 1 && <PreviewVisualizationComparison />}
                    <AppliedFilters />
                </Container>
            )}

            <Container className="box rounded p-0 clearfix position-relative overflow-hidden" style={{ marginBottom: isEditing ? 10 : 0 }}>
                <EditModeHeader isVisible={isEditing} message="Edit mode" />
            </Container>

            {!isLoadingResult && contributionsList.length === 0 && comparisonType === 'property-path' && (
                <Container className="box rounded py-4 px-4">
                    <Alert color="info">
                        Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic. Comparisons are dynamic and
                        FAIR. A comparison is created from contributions,{' '}
                        <a href="https://www.orkg.org/comparison/R44930" target="_blank" rel="noreferrer">
                            view example of comparison <Icon icon={faExternalLinkAlt} />
                        </a>
                        . To create your own comparisons in ORKG, you can either import existing data (via{' '}
                        <Link to={ROUTES.CSV_IMPORT}>CSV import</Link>) or start from scratch by adding your own contributions. From this page, you
                        can create a new comparison.
                    </Alert>
                    <h1 className="h5 mt-4">Getting started with your new comparison</h1>
                    <p>
                        Click the <em>Add contribution</em> button in the right top of your screen to get started.
                    </p>
                </Container>
            )}

            <ContainerAnimated className="box rounded p-0 clearfix position-relative" style={containerStyle}>
                {!isFailedLoadingMetadata && !isFailedLoadingResult && (
                    <>
                        {!isLoadingResult && contributionsList.length > 0 && <ComparisonTable object={comparisonResource} />}

                        {!isLoadingResult && contributionsList.length <= 1 && comparisonType !== 'property-path' && (
                            <Alert className="mt-3 text-center" color="danger">
                                Sorry, this comparison doesn't have the minimum amount of research contributions to compare on
                            </Alert>
                        )}

                        {isLoadingResult && <ComparisonLoadingComponent />}
                    </>
                )}
            </ContainerAnimated>

            <Container className="box rounded px-5 clearfix position-relative mt-4">
                <DataSources />
            </Container>
            {isPublished && <ProvenanceBox />}
        </div>
    );
};

export default Comparison;
