import { useState, useEffect } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, ButtonGroup, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faHistory, faWindowMaximize, faChartBar, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import ExportToLatex from 'components/Comparison/Export/ExportToLatex.js';
import GeneratePdf from 'components/Comparison/Export/GeneratePdf.js';
import SelectProperties from 'components/Comparison/SelectProperties';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ExportCitation from 'components/Comparison/Export/ExportCitation';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';
import NewerVersionWarning from 'components/Comparison/HistoryModal/NewerVersionWarning';
import Publish from 'components/Comparison/Publish/Publish';
import { ContainerAnimated, ComparisonTypeButton } from 'components/Comparison/styled';
import { uniq, without } from 'lodash';
import ROUTES from 'constants/routes.js';
import { useHistory } from 'react-router-dom';
import { openAuthDialog } from 'actions/auth';
import { CSVLink } from 'react-csv';
import { generateRdfDataVocabularyFile } from 'utils';
import Tippy from '@tippyjs/react';
import { useCookies } from 'react-cookie';
import ExactMatch from 'assets/img/comparison-exact-match.svg';
import IntelligentMerge from 'assets/img/comparison-intelligent-merge.svg';
import AddVisualizationModal from 'libs/selfVisModel/ComparisonComponents/AddVisualizationModal';
import { NavLink } from 'react-router-dom';
import { reverse } from 'named-urls';
import env from '@beam-australia/react-env';
import { useSelector, useDispatch } from 'react-redux';
import { setComparisonConfigurationAttribute, setComparisonContributionList } from 'actions/comparison';
import Confirm from 'reactstrap-confirm';

const ComparisonHeader = () => {
    const dispatch = useDispatch();
    const { matrixData, data } = useSelector(state => state.comparison);
    const contributions = useSelector(state => state.comparison.contributions.filter(c => c.active));
    const properties = useSelector(state => state.comparison.properties.filter(c => c.active));
    const comparisonObject = useSelector(state => state.comparison.object);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const isLoadingResult = useSelector(state => state.comparison.isLoadingResult);
    const isFailedLoadingResult = useSelector(state => state.comparison.isFailedLoadingResult);
    const { contributionsList, transpose, responseHash, comparisonType, fullWidth, viewDensity } = useSelector(
        state => state.comparison.configuration
    );

    const [, setCookie] = useCookies();
    const history = useHistory();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownDensityOpen, setDropdownDensityOpen] = useState(false);
    const [dropdownMethodOpen, setDropdownMethodOpen] = useState(false);

    const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
    const [showLatexDialog, setShowLatexDialog] = useState(false);
    const [, setShowShareDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [showAddContribution, setShowAddContribution] = useState(false);
    const [showComparisonVersions, setShowComparisonVersions] = useState(false);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);

    const user = useSelector(state => state.auth.user);

    const handleFullWidth = () => {
        setCookie('useFullWidthForComparisonTable', !fullWidth, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        dispatch(setComparisonConfigurationAttribute('fullWidth', !fullWidth));
    };

    /**
     * Toggle transpose option
     *
     */
    const toggleTranspose = () => {
        dispatch(setComparisonConfigurationAttribute('transpose', !transpose));
    };

    const handleViewDensity = density => {
        setCookie('viewDensityComparisonTable', density, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        dispatch(setComparisonConfigurationAttribute('viewDensity', density));
    };

    const handleEditContributions = async () => {
        if (comparisonObject?.id || responseHash) {
            const isConfirmed = await Confirm({
                title: 'This is a published comparison',
                message: `The comparison you are viewing is published, which means it cannot be modified. To make changes, fetch the live comparison data and try this action again`,
                cancelColor: 'light',
                confirmText: 'Fetch live data'
            });

            if (isConfirmed) {
                dispatch(setComparisonConfigurationAttribute('responseHash', null));
                //setShouldFetchLiveComparison(true);
            }
        } else {
            const isConfirmed = await Confirm({
                title: 'Edit contribution data',
                message: `You are about the edit the contributions displayed in the comparison. Changing this data does not only affect this comparison, but also other parts of the ORKG`,
                cancelColor: 'light',
                confirmText: 'Continue'
            });

            if (isConfirmed) {
                history.push(
                    reverse(ROUTES.CONTRIBUTION_EDITOR) +
                        `?contributions=${contributionsList.join(',')}${
                            comparisonObject?.hasPreviousVersion ? `&hasPreviousVersion=${comparisonObject?.hasPreviousVersion.id}` : ''
                        }`
                );
            }
        }
    };

    const handleChangeType = type => {
        dispatch(setComparisonConfigurationAttribute('responseHash', null));
        dispatch(setComparisonConfigurationAttribute('comparisonType', type));
        setDropdownMethodOpen(false);
    };

    const { versions, isLoadingVersions, hasNextVersion, loadVersions } = useComparisonVersions({ comparisonId: comparisonObject.id });

    const [showVisualizationModal, setShowVisualizationModal] = useState(false);
    const [applyReconstruction, setUseReconstructedData] = useState(false);

    const closeOnExport = () => {
        setShowVisualizationModal(false);
    };

    /**
     * Add contributions
     *
     * @param {Array[String]} newContributionIds Contribution ids to add
     */
    const addContributions = newContributionIds => {
        //setUrlNeedsToUpdate(true);
        dispatch(setComparisonConfigurationAttribute('responseHash', null));
        const contributionsIDs = without(uniq(contributionsList.concat(newContributionIds)), undefined, null, '') ?? [];
        dispatch(setComparisonContributionList(contributionsIDs));
    };

    useEffect(() => {
        if (comparisonObject.id) {
            loadVersions(comparisonObject.id);
        }
    }, [comparisonObject.id, loadVersions]);

    return (
        <>
            <Breadcrumbs researchFieldId={comparisonObject?.researchField ? comparisonObject?.researchField.id : null} />
            <ContainerAnimated className="d-flex align-items-center">
                <h1 className="h4 mt-4 mb-4 flex-grow-1">
                    Contribution comparison{' '}
                    {!isFailedLoadingMetadata && contributionsList.length > 1 && (
                        <Tippy content="The amount of compared contributions">
                            <span>
                                <Badge color="secondary" pill style={{ fontSize: '65%' }}>
                                    {contributionsList.length}
                                </Badge>
                            </span>
                        </Tippy>
                    )}
                </h1>

                {contributionsList.length > 1 && !isLoadingResult && !isFailedLoadingResult && (
                    <div style={{ marginLeft: 'auto' }} className="flex-shrink-0 mt-4">
                        <ButtonGroup className="float-right mb-4 ml-1">
                            <Dropdown group isOpen={dropdownDensityOpen} toggle={() => setDropdownDensityOpen(v => !v)} style={{ marginRight: 3 }}>
                                <DropdownToggle color="secondary" size="sm">
                                    <Icon icon={faWindowMaximize} className="mr-1" /> View
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={handleFullWidth}>
                                        <span className="mr-2">{fullWidth ? 'Reduced width' : 'Full width'}</span>
                                    </DropdownItem>
                                    <DropdownItem onClick={() => toggleTranspose(v => !v)}>Transpose table</DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem header>View density</DropdownItem>
                                    <DropdownItem active={viewDensity === 'spacious'} onClick={() => handleViewDensity('spacious')}>
                                        Spacious
                                    </DropdownItem>
                                    <DropdownItem active={viewDensity === 'normal'} onClick={() => handleViewDensity('normal')}>
                                        Normal
                                    </DropdownItem>
                                    <DropdownItem active={viewDensity === 'compact'} onClick={() => handleViewDensity('compact')}>
                                        Compact
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            {!!comparisonObject.id ? (
                                <Button
                                    color="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setUseReconstructedData(false);
                                        setShowVisualizationModal(!showVisualizationModal);
                                    }}
                                    style={{ marginRight: 3 }}
                                >
                                    <Icon icon={faChartBar} className="mr-1" /> Visualize
                                </Button>
                            ) : (
                                <Tippy
                                    hideOnClick={false}
                                    content="Cannot use self-visualization-service for unpublished comparison. You must publish the comparison first to use this functionality."
                                >
                                    <span style={{ marginRight: 3 }} className="btn btn-secondary btn-sm disabled">
                                        <Icon icon={faChartBar} className="mr-1" /> Visualize
                                    </span>
                                </Tippy>
                            )}
                            <Dropdown group isOpen={dropdownOpen} toggle={() => setDropdownOpen(v => !v)}>
                                <DropdownToggle color="secondary" size="sm" className="rounded-right">
                                    <span className="mr-2">More</span> <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right style={{ zIndex: '1031' }}>
                                    <DropdownItem header>Customize</DropdownItem>
                                    <DropdownItem onClick={() => setShowAddContribution(v => !v)}>Add contribution</DropdownItem>
                                    <DropdownItem onClick={() => setShowPropertiesDialog(v => !v)}>Select properties</DropdownItem>
                                    <Dropdown isOpen={dropdownMethodOpen} toggle={() => setDropdownMethodOpen(v => !v)} direction="left">
                                        <DropdownToggle tag="div" className="dropdown-item" style={{ cursor: 'pointer' }}>
                                            Comparison method
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <div className="d-flex px-2">
                                                <ComparisonTypeButton
                                                    color="link"
                                                    className="p-0 m-1"
                                                    onClick={() => handleChangeType('merge')}
                                                    active={comparisonType !== 'path'}
                                                >
                                                    <img src={IntelligentMerge} alt="Intelligent merge example" />
                                                </ComparisonTypeButton>

                                                <ComparisonTypeButton
                                                    color="link"
                                                    className="p-0 m-1"
                                                    onClick={() => handleChangeType('path')}
                                                    active={comparisonType === 'path'}
                                                >
                                                    <img src={ExactMatch} alt="Exact match example" />
                                                </ComparisonTypeButton>
                                            </div>
                                        </DropdownMenu>
                                    </Dropdown>
                                    <DropdownItem onClick={handleEditContributions}>Edit contributions</DropdownItem>

                                    <DropdownItem divider />
                                    <DropdownItem header>Export</DropdownItem>
                                    <DropdownItem onClick={() => setShowLatexDialog(v => !v)}>Export as LaTeX</DropdownItem>
                                    {matrixData ? (
                                        <CSVLink
                                            data={matrixData}
                                            filename="ORKG Contribution Comparison.csv"
                                            className="dropdown-item"
                                            target="_blank"
                                            onClick={() => setDropdownOpen(v => !v)}
                                        >
                                            Export as CSV
                                        </CSVLink>
                                    ) : (
                                        ''
                                    )}
                                    <GeneratePdf id="comparisonTable" />
                                    <DropdownItem
                                        onClick={() =>
                                            generateRdfDataVocabularyFile(
                                                data,
                                                contributions,
                                                properties,
                                                comparisonObject.id
                                                    ? {
                                                          title: comparisonObject.label,
                                                          description: comparisonObject.description,
                                                          creator: comparisonObject.createdBy,
                                                          date: comparisonObject.createdAt
                                                      }
                                                    : { title: '', description: '', creator: '', date: '' }
                                            )
                                        }
                                    >
                                        Export as RDF
                                    </DropdownItem>
                                    {comparisonObject?.id && comparisonObject?.doi && (
                                        <DropdownItem onClick={() => setShowExportCitationsDialog(v => !v)}>Export Citation</DropdownItem>
                                    )}
                                    {comparisonObject?.id && (
                                        <DropdownItem
                                            tag="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`https://mybinder.org/v2/gl/TIBHannover%2Forkg%2Forkg-notebook-boilerplate/HEAD?urlpath=notebooks%2FComparison.ipynb%3Fcomparison_id%3D%22${comparisonObject.id}%22%26autorun%3Dtrue`}
                                        >
                                            Jupyter Notebook <Icon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                    )}
                                    <DropdownItem divider />
                                    <DropdownItem onClick={() => setShowShareDialog(v => !v)}>Share link</DropdownItem>
                                    <DropdownItem
                                        onClick={e => {
                                            if (!!!user) {
                                                dispatch(openAuthDialog({ action: 'signin', signInRequired: true }));
                                            } else {
                                                setShowPublishDialog(v => !v);
                                            }
                                        }}
                                    >
                                        Publish
                                    </DropdownItem>
                                    {!isLoadingVersions && versions?.length > 1 && (
                                        <>
                                            <DropdownItem divider />
                                            <DropdownItem onClick={() => setShowComparisonVersions(v => !v)}>
                                                <Icon icon={faHistory} /> <span className="mr-2">History</span>
                                            </DropdownItem>
                                        </>
                                    )}
                                    {comparisonObject?.id && (
                                        <>
                                            <DropdownItem divider />
                                            <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: comparisonObject.id })}>
                                                View resource
                                            </DropdownItem>
                                        </>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </ButtonGroup>
                    </div>
                )}
            </ContainerAnimated>
            {!isLoadingVersions && hasNextVersion && (
                <NewerVersionWarning versions={versions} comparisonId={comparisonObject?.id || comparisonObject?.hasPreviousVersion?.id} />
            )}
            {!isLoadingVersions && versions?.length > 1 && showComparisonVersions && (
                <HistoryModal
                    comparisonId={comparisonObject?.id || comparisonObject?.hasPreviousVersion?.id}
                    toggle={() => setShowComparisonVersions(v => !v)}
                    showDialog={showComparisonVersions}
                />
            )}
            <Publish
                showDialog={showPublishDialog}
                toggle={() => setShowPublishDialog(v => !v)}
                nextVersions={!isLoadingVersions && hasNextVersion ? versions : []}
            />
            <AddContribution onAddContributions={addContributions} showDialog={showAddContribution} toggle={() => setShowAddContribution(v => !v)} />
            <ExportToLatex showDialog={showLatexDialog} toggle={() => setShowLatexDialog(v => !v)} s />
            <ExportCitation
                showDialog={showExportCitationsDialog}
                toggle={() => setShowExportCitationsDialog(v => !v)}
                DOI={comparisonObject?.doi}
                comparisonId={comparisonObject?.id}
            />
            <AddVisualizationModal
                toggle={() => setShowVisualizationModal(v => !v)}
                showDialog={showVisualizationModal}
                closeOnExport={closeOnExport}
                useReconstructedData={applyReconstruction}
            />
            <SelectProperties showPropertiesDialog={showPropertiesDialog} togglePropertiesDialog={() => setShowPropertiesDialog(v => !v)} />
        </>
    );
};

export default ComparisonHeader;
