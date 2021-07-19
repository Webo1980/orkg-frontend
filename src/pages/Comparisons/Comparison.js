import { useState } from 'react';
import { Alert } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from 'components/Comparison/Comparison';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import ProvenanceBox from 'components/Comparison/ProvenanceBox/ProvenanceBox';
import ObservatoryBox from 'components/Comparison/ProvenanceBox/ObservatoryBox';
import RelatedResources from 'components/Comparison/RelatedResources/RelatedResources';
import RelatedFigures from 'components/Comparison/RelatedResources/RelatedFigures';
import ComparisonMetaData from 'components/Comparison/ComparisonMetaData';
import Share from 'components/Comparison/Share.js';
import { ContainerAnimated } from 'components/Comparison/styled';
import useComparison from 'components/Comparison/hooks/useComparison';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import ROUTES from 'constants/routes.js';
import { useHistory, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import PreviewVisualizationComparison from 'libs/selfVisModel/ComparisonComponents/PreviewVisualizationComparison';
import env from '@beam-australia/react-env';
import { useSelector } from 'react-redux';
import ComparisonHeader from 'components/Comparison/ComparisonHeader/ComparisonHeader';
import AppliedFilters from 'components/Comparison/ComparisonHeader/AppliedFilters';

const Comparison = () => {
    const { removeContribution, updateRulesOfProperty } = useComparison({});

    const comparisonObject = useSelector(state => state.comparison.object);
    const {
        contributions,
        properties,
        data,
        filterControlData,
        isLoadingMetadata,
        isFailedLoadingMetadata,
        isLoadingResult,
        isFailedLoadingResult,
        errors
    } = useSelector(state => state.comparison);
    const { transpose, comparisonType, contributionsList, fullWidth, viewDensity } = useSelector(state => state.comparison.configuration);

    /** adding some additional state for meta data **/

    const [cookies, setCookie] = useCookies();
    const history = useHistory();

    const [hideScrollHint, setHideScrollHint] = useState(cookies.seenShiftMouseWheelScroll ? cookies.seenShiftMouseWheelScroll : false);

    const [showShareDialog, setShowShareDialog] = useState(false);

    /**
     * Is case of an error the user can go to the previous link in history
     */
    const handleGoBack = () => {
        history.goBack();
    };

    const onDismissShiftMouseWheelScroll = () => {
        // dismiss function for the alert thingy!;
        setCookie('seenShiftMouseWheelScroll', true, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        setHideScrollHint(true);
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 100px)' } : {};

    return (
        <div>
            <ComparisonHeader />

            <ContainerAnimated className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix position-relative" style={containerStyle}>
                <ShareLinkMarker typeOfLink="comparison" title={comparisonObject?.label} />
                {!isLoadingMetadata && (isFailedLoadingResult || isFailedLoadingMetadata) && (
                    <div>
                        {isFailedLoadingResult && contributionsList.length < 2 ? (
                            <>
                                <div className="clearfix" />
                                <Alert color="info">Please select a minimum of two research contributions to compare on.</Alert>
                            </>
                        ) : (
                            <Alert color="danger">
                                {errors ? (
                                    <>{errors}</>
                                ) : (
                                    <>
                                        <strong>Error.</strong> The comparison service is unreachable. Please come back later and try again.{' '}
                                        <span
                                            className="btn-link"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleGoBack}
                                            onKeyDown={e => (e.keyCode === 13 ? handleGoBack : undefined)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            Go back
                                        </span>{' '}
                                        or <Link to={ROUTES.HOME}>go to the homepage</Link>.
                                    </>
                                )}
                            </Alert>
                        )}
                    </div>
                )}

                <>
                    {!isFailedLoadingMetadata && !isFailedLoadingResult && (
                        <div className="p-0 d-flex align-items-start">
                            <div className="flex-grow-1">
                                <h2 className="h4 mb-4 mt-4">{comparisonObject.label ? comparisonObject.label : 'Compare'}</h2>

                                {!isFailedLoadingMetadata && <ComparisonMetaData metaData={comparisonObject} />}
                            </div>

                            {comparisonObject.id && <ObservatoryBox />}
                        </div>
                    )}
                    {!isFailedLoadingMetadata && !isFailedLoadingResult && (
                        <>
                            {contributionsList.length > 3 && (
                                <Alert className="mt-3" color="info" isOpen={!hideScrollHint} toggle={onDismissShiftMouseWheelScroll}>
                                    <Icon icon={faLightbulb} /> Use{' '}
                                    <b>
                                        <i>Shift</i>
                                    </b>{' '}
                                    +{' '}
                                    <b>
                                        <i>Mouse Wheel</i>
                                    </b>{' '}
                                    for horizontal scrolling in the table.
                                </Alert>
                            )}
                            <AppliedFilters />
                            {!isLoadingResult ? (
                                contributionsList.length > 1 ? (
                                    <div className="mt-1">
                                        {/*<PreviewVisualizationComparison />*/}

                                        <ComparisonTable
                                            data={data}
                                            properties={properties}
                                            contributions={contributions}
                                            removeContribution={removeContribution}
                                            transpose={transpose}
                                            viewDensity={viewDensity}
                                            filterControlData={filterControlData}
                                            updateRulesOfProperty={updateRulesOfProperty}
                                            comparisonType={comparisonType}
                                        />
                                    </div>
                                ) : (
                                    <Alert className="mt-3 text-center" color="danger">
                                        Sorry, this comparison doesn't have the minimum amount of research contributions to compare on
                                    </Alert>
                                )
                            ) : (
                                <ComparisonLoadingComponent />
                            )}
                        </>
                    )}
                </>

                <div className="mt-3 clearfix">
                    {contributionsList.length > 1 && !isLoadingResult && (
                        <>
                            <RelatedResources resourcesStatements={comparisonObject.resources ? comparisonObject.resources : []} />
                            <RelatedFigures figureStatements={comparisonObject.figures ? comparisonObject.figures : []} />
                        </>
                    )}
                    {!isFailedLoadingMetadata && comparisonObject.references && comparisonObject.references.length > 0 && (
                        <div style={{ lineHeight: 1.5 }}>
                            <h3 className="mt-5 h5">Data sources</h3>
                            <ul>
                                {comparisonObject.references.map((reference, index) => (
                                    <li key={`ref${index}`}>
                                        <small>
                                            <i>
                                                <ValuePlugins type="literal">{reference.label}</ValuePlugins>
                                            </i>
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ContainerAnimated>

            {comparisonObject.id && <ProvenanceBox />}

            <Share showDialog={showShareDialog} toggle={() => setShowShareDialog(v => !v)} />
        </div>
    );
};

export default Comparison;
