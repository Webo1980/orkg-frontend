import { React, memo, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
// import Graph from 'react-graph-vis';
import Table from 'components/ViewPaper/Annotations/Table';
import makeData from 'components/ViewPaper/Annotations/makeData';
import { Modal, ModalHeader, ModalBody, Input, Form, FormGroup, Label, Button } from 'reactstrap';
import { getResource, updateResource, createResource } from 'services/backend/resources';
import uniqBy from 'lodash/uniqBy';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faProjectDiagram, faHome, faSitemap, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import flattenDeep from 'lodash/flattenDeep';
// moving GraphVis here in order to maintain the layouts and status related stuff;
import GraphVis from 'libs/gizmo/GraphVis';
import SearchAutoComplete from './SearchAutoComplete';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { getPaperData_ViewPaper } from 'utils';

const PaperAnnotations = props => {
    const columns = useMemo(
        () => [
            {
                Header: ' ',
                columns: [
                    {
                        Header: 'Property',
                        accessor: 'property'
                    },
                    {
                        Header: 'Label',
                        accessor: 'label'
                    },
                    {
                        Header: 'Data',
                        accessor: 'data'
                    }
                ]
            }
        ],
        []
    );

    const [data, setData] = useState(() => makeData(20));
    const [originalData] = useState(data);
    const [contributions, setContributions] = useState([]);
    const [skipPageReset, setSkipPageReset] = useState(false);

    //useEffect(() => {
    //setObservatory(props.observatory);
    //}, [props.observatory]);

    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page
        setSkipPageReset(true);
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value
                    };
                }
                return row;
            })
        );
    };

    const loadPaperData = useCallback(() => {
        //setIsLoading(true);
        //dispatch(resetStatementBrowser());
        const array = [];
        getResource(props.paperId)
            .then(paperResource => {
                if (!paperResource.classes.includes(CLASSES.PAPER)) {
                    //setIsLoading(false);
                    //setIsLoadingFailed(true);
                    return;
                }
                getStatementsBySubject({ id: props.paperId }).then(paperStatements => {
                    const paperData = getPaperData_ViewPaper(paperResource, paperStatements);
                    paperData.contributions.map(c => {
                        getStatementsBySubject({ id: c.id }).then(cc => {
                            cc.map(s => {
                                getDataFromApi(s.object.id);
                                //console.log('------------------------------------------');
                                //console.log(s);
                                array.push({ property: s.predicate.label, label: s.object.label, data: '' });
                            });
                        });
                    });
                    // Set document title
                    //document.title = `${paperResource.label} - ORKG`;
                    //dispatch(loadPaper({ ...paperData, verified: verified }));
                    //setIsLoading(false);
                    setContributions(array);
                    //loadAuthorsORCID(paperData.authors);
                    return paperData.contributions;
                });
            })
            .catch(error => {
                //setIsLoading(false);
                //setIsLoadingFailed(true);
            });
    }, [props.paperId]);

    useEffect(() => {
        loadPaperData();
    }, [loadPaperData, props.paperId]);

    useEffect(() => {
        setSkipPageReset(false);
        //getDataFromApi(props.re);
    }, [data]);
    // Let's add a data resetter/randomizer to help
    // illustrate that flow...
    const resetData = () => setData(originalData);

    //updateDepthRange = (value, fullGraph) => {
    // called from the child to ensure that the depth has correct range
    //if (fullGraph) {
    //this.setState({ maxDepth: value, depth: value, seenFullGraph: true });
    //return;
    //}
    //if (value < this.state.depth || this.state.seenFullGraph === true) {
    // Case we have seen the full Graph so we just update the graph view
    //this.setState({ depth: value });
    //} else {
    //if (!fullGraph && this.state.seenFullGraph === false) {
    //Case we want to load more data
    //this.setState({ depth: value, seenFullGraph: false });
    //} else {
    //Case we have seen the full Graph on going deeper
    //this.setState({ maxDepth: value, seenFullGraph: true });
    //}
    //}
    //};

    //propagateDictionary = () => {
    //this.searchComponent.current.updateDictionary();
    //};

    const getDataFromApi = async resourceId => {
        try {
            const statements = await getStatementsBySubject({ id: resourceId });
            //console.log(statements);
            if (statements.length === 0) {
                return {}; // we dont have incremental data
            } else {
                // result is the incremental data we get;
                console.log(statements);
                return statements;
                //return processStatements(statements);
            }
        } catch (error) {
            return {}; // TODO: handle unsaved resources
        }
    };

    const fetchMultipleResourcesFromAPI = async resourceIds => {
        try {
            const objectStatements = await getStatementsBySubjects({ ids: resourceIds });
            console.log(objectStatements);
            if (objectStatements.length === 0) {
                return {}; // we dont have incremental data
            } else {
                return this.processMultiStatements(objectStatements);
            }
        } catch (error) {
            return {}; // TODO: handle unsaved resources
        }
    };

    const loadStatements = async () => {
        this.setState({ isLoadingStatements: true, initializeGraph: false });
        //this.graphVis.stopBackgroundProcesses();
        if (this.seenDepth < this.state.depth) {
            if (this.props.paperId) {
                const statements = await this.getResourceAndStatements(this.props.paperId, 0, []);
                const auxiliaryMetaDataNode = true; // flag for using or not using auxiliary node for meta info
                const result = this.processStatements(statements, auxiliaryMetaDataNode);
                this.setState({ nodes: result.nodes, edges: result.edges });
            } else {
                await this.visualizeAddPaper();
            }
        }
        this.setState({ isLoadingStatements: false, initializeGraph: true });
    };

    //render() {
    /*const events = {
    select: function (event) {
    var { nodes, edges } = event;
    }
    };*/
    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle} size="lg" style={{ maxWidth: '90%', marginBottom: 0 }}>
            <ModalHeader toggle={props.toggle}>
                <div className="d-flex" style={{ height: '40px' }}>
                    <div style={{ width: '300px', height: '40px', paddingTop: '5px' }}>Paper Annotations</div>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '0', minHeight: '100px', height: '500px' }}>
                <Table columns={columns} data={contributions} updateMyData={updateMyData} skipPageReset={skipPageReset} />
            </ModalBody>
        </Modal>
    );
    //}
};

PaperAnnotations.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addPaper: PropTypes.object.isRequired,
    statementBrowser: PropTypes.object.isRequired,
    paperId: PropTypes.string,
    addPaperVisualization: PropTypes.bool,
    paperObject: PropTypes.object
};

const mapStateToProps = state => ({
    addPaper: state.addPaper,
    statementBrowser: state.statementBrowser
});

export default connect(mapStateToProps)(PaperAnnotations);
