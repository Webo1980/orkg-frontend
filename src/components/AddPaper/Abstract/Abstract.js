import React, { Component } from 'react';
import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import {
    nextStep,
    previousStep,
    createContribution,
    prefillStatements,
    createAnnotation,
    clearAnnotations,
    toggleAbstractDialog,
    setAbstractDialogView,
    fetchAbstract,
    getAnnotation
} from 'actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faThList, faMagic } from '@fortawesome/free-solid-svg-icons';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import randomcolor from 'randomcolor';
import styled from 'styled-components';
import AbstractInputView from './AbstractInputView';
import AbstractAnnotatorView from './AbstractAnnotatorView';
import AbstractRangesList from './AbstractRangesList';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { guid } from 'utils';
import toArray from 'lodash/toArray';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

class Abstract extends Component {
    constructor(props) {
        super(props);

        this.state = {
            annotationError: null,
            showError: false,
            classOptions: [
                {
                    id: 'PROCESS',
                    label: 'Process',
                    description: 'Natural phenomenon, or independent/dependent activities.E.g., growing(Bio), cured(MS), flooding(ES).'
                },
                {
                    id: 'DATA',
                    label: 'Data',
                    description:
                        'The data themselves, or quantitative or qualitative characteristics of entities. E.g., rotational energy (Eng), tensile strength (MS), the Chern character (Mat).'
                },
                {
                    id: 'MATERIAL',
                    label: 'Material',
                    description: 'A physical or digital entity used for scientific experiments. E.g., soil (Agr), the moon (Ast), the set (Mat).'
                },
                {
                    id: 'METHOD',
                    label: 'Method',
                    description:
                        'A commonly used procedure that acts on entities. E.g., powder X-ray (Che), the PRAM analysis (CS), magnetoencephalography (Med).'
                }
            ],
            certaintyThreshold: [0.5],
            validation: true,
            classColors: {
                process: '#7fa2ff',
                data: '	#9df28a',
                material: '#EAB0A2',
                method: '#D2B8E5'
            }
        };
    }

    componentDidMount() {
        this.props.fetchAbstract({ DOI: this.props.doi, classOptions: this.state.classOptions });
    }

    getClassColor = rangeClass => {
        if (!rangeClass) {
            return '#ffb7b7';
        }
        if (this.state.classColors[rangeClass.toLowerCase()]) {
            return this.state.classColors[rangeClass.toLowerCase()];
        } else {
            const newColor = randomcolor({ luminosity: 'light', seed: rangeClass.toLowerCase() });
            this.setState({ classColors: { ...this.state.classColors, [rangeClass.toLowerCase()]: newColor } });
            return newColor;
        }
    };

    getExistingPredicateId = property => {
        if (this.props.properties.allIds.length > 0) {
            const p = this.props.properties.allIds.filter(pId => this.props.properties.byId[pId].label === property.label);
            if (p.length > 0) {
                // Property Already exists
                return p[0];
            }
        }
        return false;
    };

    getExistingRange = range => {
        if (this.props.properties.allIds.length > 0) {
            const p = this.props.properties.allIds.filter(pId => this.props.properties.byId[pId].label === range.class.label);
            if (p.length > 0) {
                // Property Already exists
                // Check value
                const v = this.props.properties.byId[p[0]].valueIds.filter(id => {
                    if (this.props.values.byId[id].label === range.text) {
                        return id;
                    } else {
                        return false;
                    }
                });
                if (v.length > 0) {
                    return true;
                }
            }
        }
        return false;
    };

    handleInsertData = () => {
        const classesID = {};
        const createdProperties = {};
        const statements = { properties: [], values: [] };
        const rangesArray = toArray(this.props.ranges).filter(r => r.certainty >= this.state.certaintyThreshold);
        if (rangesArray.length > 0) {
            rangesArray.map(range => {
                let propertyId;
                if (!this.getExistingRange(range) && range.class.id) {
                    if (classesID[range.class.id]) {
                        propertyId = classesID[range.class.id];
                    } else {
                        const pID = guid();
                        classesID[range.class.id] = pID;
                        propertyId = pID;
                    }
                    if (!createdProperties[propertyId]) {
                        const existingPredicateId = this.getExistingPredicateId(range.class);
                        if (!existingPredicateId) {
                            statements['properties'].push({
                                propertyId: propertyId,
                                existingPredicateId: range.class.id.toLowerCase() !== range.class.label.toLowerCase() ? range.class.id : null,
                                label: range.class.label
                            });
                        } else {
                            propertyId = existingPredicateId;
                        }
                        createdProperties[propertyId] = propertyId;
                    }
                    statements['values'].push({
                        label: range.text,
                        type: 'object',
                        propertyId: propertyId
                    });
                }
                return null;
            });
        }
        // Add the statements to the selected contribution
        this.props.prefillStatements({ statements, resourceId: this.props.contributions.byId[this.props.selectedContribution].resourceId });
        this.props.toggleAbstractDialog();
    };

    handleChangeAbstract = () => {
        if (this.props.abstractDialogView === 'input') {
            if (this.props.abstract.replace(/^\s+|\s+$/g, '') === '' || this.props.abstract.replace(/^\s+|\s+$/g, '').split(' ').length <= 1) {
                this.setState({ validation: false });
                return;
            }
            this.props.getAnnotation({ abstract: this.props.abstract, classOptions: this.state.classOptions });
        }
        this.props.setAbstractDialogView(this.props.abstractDialogView === 'input' ? 'annotator' : 'input');
        this.setState({ validation: true });
    };

    handleChangeCertaintyThreshold = values => {
        this.setState({ certaintyThreshold: values });
    };

    handleChangeView = view => {
        this.props.setAbstractDialogView(view);
    };

    render() {
        let currentStepDetails;
        switch (this.props.abstractDialogView) {
            case 'annotator':
            default:
                currentStepDetails = (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <AbstractAnnotatorView
                            certaintyThreshold={this.state.certaintyThreshold}
                            handleChangeCertaintyThreshold={this.handleChangeCertaintyThreshold}
                            classOptions={this.state.classOptions}
                            annotationError={this.state.annotationError}
                            getClassColor={this.getClassColor}
                        />
                    </AnimationContainer>
                );
                break;
            case 'input':
                currentStepDetails = (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <AbstractInputView validation={this.state.validation} classOptions={this.state.classOptions} />
                    </AnimationContainer>
                );
                break;
            case 'list':
                currentStepDetails = (
                    <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <AbstractRangesList
                            certaintyThreshold={this.state.certaintyThreshold}
                            classOptions={this.state.classOptions}
                            getClassColor={this.getClassColor}
                        />
                    </AnimationContainer>
                );
                break;
        }

        return (
            <Modal isOpen={this.props.showAbstractDialog} toggle={this.props.toggleAbstractDialog} size="lg">
                <ModalHeader toggle={this.props.toggleAbstractDialog}>Abstract annotator</ModalHeader>
                <ModalBody>
                    <div className={'clearfix'}>
                        {(this.props.isAbstractLoading || this.props.isAnnotationLoading) && (
                            <div className="text-center text-primary">
                                <span style={{ fontSize: 80 }}>
                                    <Icon icon={faSpinner} spin />
                                </span>
                                <br />
                                <h2 className="h5">{this.props.isAbstractLoading ? 'Loading abstract...' : 'Loading annotations...'}</h2>
                            </div>
                        )}

                        <TransitionGroup exit={false}>{currentStepDetails}</TransitionGroup>
                    </div>
                </ModalBody>
                <ModalFooter>
                    {this.props.abstractDialogView === 'input' ? (
                        <>
                            <Button color="primary" className="float-right" onClick={this.handleChangeAbstract}>
                                Annotate Abstract
                            </Button>
                        </>
                    ) : this.props.abstractDialogView === 'list' ? (
                        <>
                            <Button color="secondary" outline className="float-left" onClick={() => this.handleChangeView('annotator')}>
                                <Icon icon={faMagic} /> Annotator
                            </Button>

                            <Button color="primary" className="float-right" onClick={this.handleInsertData}>
                                Insert Data
                            </Button>

                            <Button color="light" className="float-right mr-2" onClick={this.handleChangeAbstract}>
                                Change abstract
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="secondary" outline className="float-left" onClick={() => this.handleChangeView('list')}>
                                <Icon icon={faThList} /> List of annotations
                            </Button>

                            <Button color="primary" className="float-right" onClick={this.handleInsertData}>
                                Insert Data
                            </Button>

                            <Button color="light" className="float-right mr-2" onClick={this.handleChangeAbstract}>
                                Change abstract
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </Modal>
        );
    }
}

Abstract.propTypes = {
    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    abstract: PropTypes.string.isRequired,
    ranges: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    doi: PropTypes.string,
    selectedContribution: PropTypes.string.isRequired,
    contributions: PropTypes.object.isRequired,
    createContribution: PropTypes.func.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    createAnnotation: PropTypes.func.isRequired,
    clearAnnotations: PropTypes.func.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    showAbstractDialog: PropTypes.bool.isRequired,
    toggleAbstractDialog: PropTypes.func.isRequired,
    setAbstractDialogView: PropTypes.func.isRequired,
    abstractDialogView: PropTypes.string.isRequired,

    isAbstractLoading: PropTypes.bool.isRequired,
    isAnnotationLoading: PropTypes.bool.isRequired,

    getAnnotation: PropTypes.func.isRequired,
    fetchAbstract: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    selectedContribution: state.addPaper.selectedContribution,
    title: state.addPaper.title,
    doi: state.addPaper.doi,
    abstract: state.addPaper.abstract,
    ranges: state.addPaper.ranges,
    contributions: state.addPaper.contributions,
    resources: state.statementBrowser.resources,
    properties: state.statementBrowser.properties,
    values: state.statementBrowser.values,
    showAbstractDialog: state.addPaper.showAbstractDialog,
    abstractDialogView: state.addPaper.abstractDialogView,

    isAbstractLoading: state.addPaper.isAbstractLoading,
    isAnnotationLoading: state.addPaper.isAnnotationLoading
});

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
    createContribution: data => dispatch(createContribution(data)),
    prefillStatements: data => dispatch(prefillStatements(data)),
    createAnnotation: data => dispatch(createAnnotation(data)),
    clearAnnotations: () => dispatch(clearAnnotations()),
    toggleAbstractDialog: () => dispatch(toggleAbstractDialog()),
    setAbstractDialogView: data => dispatch(setAbstractDialogView(data)),
    getAnnotation: data => dispatch(getAnnotation(data)),
    fetchAbstract: data => dispatch(fetchAbstract(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(Abstract);
