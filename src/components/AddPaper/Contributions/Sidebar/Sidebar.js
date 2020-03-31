import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { SideBarHeaderStyle, StyledSideBar } from './styled';
import { updateAbstract, toggleAbstractDialog } from 'actions/addPaper';
import { connect } from 'react-redux';
import toArray from 'lodash/toArray';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import DraggableValue from './DraggableValue';
import Tooltip from 'components/Utils/Tooltip';
import { StyledGraggableData } from './styled';
import Sticky from 'react-sticky-el';

function Sidebar(props) {
    const [rangesLimit, setRangesLimit] = useState(6);
    if (props.resources.byId[props.resourceId] && props.resources.byId[props.resourceId].propertyIds.length > 0) {
        return (
            <StyledSideBar className="col-md-3 scrollarea" style={{ position: 'relative' }}>
                <Sticky topOffset={0} stickyClassName={'isSticky'} boundaryElement=".scrollarea">
                    <div>
                        <SideBarHeaderStyle>
                            {' '}
                            <Tooltip
                                message={
                                    <span>
                                        Here we list resources extracted from the abstract, you can drag and drop items to your contributions data.
                                    </span>
                                }
                            >
                                Resources that might be interesting
                            </Tooltip>{' '}
                        </SideBarHeaderStyle>
                        <div className="d-block">
                            <div className="p-2">
                                {props.isAbstractLoading && (
                                    <ContentLoader title={'Loading abstract'} height={120} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                                        <rect x="0" y="18" rx="7" ry="7" width="340" height="120" />
                                    </ContentLoader>
                                )}
                                {!props.isAbstractLoading && props.isAbstractFailedLoading && (
                                    <div>
                                        We couldn't fetch the abstract of the paper,{' '}
                                        <Button
                                            style={{ verticalAlign: 'initial', fontStyle: 'italic' }}
                                            color="link"
                                            onClick={props.toggleAbstractDialog}
                                            className="p-0"
                                        >
                                            please enter it manually
                                        </Button>
                                    </div>
                                )}
                                {!props.isAbstractLoading && props.isAnnotationLoading && (
                                    <ContentLoader
                                        title={'Loading annotation'}
                                        height={120}
                                        speed={2}
                                        primaryColor="#f3f3f3"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="18" rx="7" ry="7" width="340" height="120" />
                                    </ContentLoader>
                                )}
                                {!props.isAnnotationLoading && props.isAnnotationFailedLoading && (
                                    <div>Failed to connect to the annotation service!</div>
                                )}
                                {!props.isAbstractLoading &&
                                    !props.isAbstractFailedLoading &&
                                    !props.isAnnotationLoading &&
                                    !props.isAnnotationFailedLoading && (
                                        <div className="p-2">
                                            {props.resources.byId[props.resourceId] && props.resources.byId[props.resourceId].propertyIds.length > 0 && (
                                                <>
                                                    <StyledGraggableData className={'scrollbox'}>
                                                        {toArray(props.ranges)
                                                            .sort((a, b) => (a.certainty > b.certainty ? -1 : 1))
                                                            .slice(0, rangesLimit)
                                                            .map(range => {
                                                                return (
                                                                    <DraggableValue
                                                                        key={`s${range.id}`}
                                                                        resourceId={range.resourceId}
                                                                        id={range.id}
                                                                        label={range.text}
                                                                    />
                                                                );
                                                            })}
                                                    </StyledGraggableData>
                                                    {toArray(props.ranges).length > rangesLimit && (
                                                        <Button
                                                            style={{ verticalAlign: 'initial', fontSize: 'smaller' }}
                                                            color="link"
                                                            onClick={() => setRangesLimit(prev => prev + 6)}
                                                            className="p-0"
                                                        >
                                                            + See more
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </Sticky>
            </StyledSideBar>
        );
    } else {
        return '';
    }
}

Sidebar.propTypes = {
    doi: PropTypes.string,
    abstract: PropTypes.string.isRequired,
    ranges: PropTypes.object,
    title: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    updateAbstract: PropTypes.func.isRequired,
    isAbstractLoading: PropTypes.bool.isRequired,
    isAbstractFailedLoading: PropTypes.bool.isRequired,
    isAnnotationLoading: PropTypes.bool.isRequired,
    isAnnotationFailedLoading: PropTypes.bool.isRequired,
    toggleAbstractDialog: PropTypes.func.isRequired,
    resources: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        title: state.addPaper.title,
        doi: state.addPaper.doi,
        abstract: state.addPaper.abstract,
        ranges: state.addPaper.ranges,
        isAbstractLoading: state.addPaper.isAbstractLoading,
        isAbstractFailedLoading: state.addPaper.isAbstractFailedLoading,
        isAnnotationLoading: state.addPaper.isAnnotationLoading,
        isAnnotationFailedLoading: state.addPaper.isAnnotationFailedLoading,
        resourceId: state.addPaper.contributions.byId[state.addPaper.selectedContribution]
            ? state.addPaper.contributions.byId[state.addPaper.selectedContribution].resourceId
            : null,
        resources: state.statementBrowser.resources
    };
};

const mapDispatchToProps = dispatch => ({
    updateAbstract: data => dispatch(updateAbstract(data)),
    toggleAbstractDialog: () => dispatch(toggleAbstractDialog())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);
