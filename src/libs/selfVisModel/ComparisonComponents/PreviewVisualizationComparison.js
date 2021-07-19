import React, { useState, useEffect } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getVisualization } from 'services/similarity/index';
import SingleVisualizationComponent from './SingleVisualizationComponent';
import PreviewCarouselComponent from './PreviewCarouselComponent';
import ContentLoader from 'react-content-loader';
import { getVisualizationData } from 'utils';
import { useSelector, useDispatch } from 'react-redux';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { find } from 'lodash';

function PreviewVisualizationComparison() {
    const [isLoading, setIsLoading] = useState(false);
    const [visData, setVisData] = useState([]);

    const comparisonObject = useSelector(state => state.comparison.object);
    const { data, isLoadingResult, isFailedLoadingResult } = useSelector(state => state.comparison);
    const contributions = useSelector(state => state.comparison.contributions.filter(c => c.active));
    const properties = useSelector(state => state.comparison.properties.filter(c => c.active));
    const { contributionsList, predicatesList } = useSelector(state => state.comparison.configuration);

    const [showVisualizationModal, setShowVisualizationModal] = useState(false);
    const [applyReconstruction, setUseReconstructedData] = useState(false);

    const model = new SelfVisDataModel();
    model.integrateInputData({
        metaData: comparisonObject,
        contributions,
        properties,
        data,
        contributionsList,
        predicatesList
    });

    /**
     * Expand a preview of a visualization
     *
     * @param {Boolean} val weather to use reconstructed data
     */
    const expandVisualization = val => {
        setUseReconstructedData(val);
        if (val === false) {
            const model = new SelfVisDataModel();
            model.resetCustomizationModel();
        }
        //setShowVisualizationModal(true);
    };
    console.log('PreviewVisualizationComparison');

    useEffect(() => {
        const fetchVisualizationData = () => {
            console.log('fetchVisualizationData');
            if (comparisonObject.visualizations && comparisonObject.visualizations.length) {
                setIsLoading(true);
                // Get the reconstruction model from the comparison service
                const reconstructionModelsCalls = Promise.all(comparisonObject.visualizations.map(v => getVisualization(v.id).catch(() => false)));
                // Get the meta data for each visualization
                const visDataCalls = getStatementsBySubjects({ ids: comparisonObject.visualizations.map(v => v.id) }).then(
                    visualizationsStatements => {
                        const svisualizations = visualizationsStatements.map(visualizationStatements => {
                            const resourceSubject = find(comparisonObject.visualizations, { id: visualizationStatements.id });
                            return getVisualizationData(
                                visualizationStatements.id,
                                visualizationStatements && resourceSubject.label ? resourceSubject.label : 'No Title',
                                visualizationStatements.statements
                            );
                        });
                        return svisualizations;
                    }
                );
                Promise.all([visDataCalls, reconstructionModelsCalls]).then(result => {
                    // zip the result
                    result[0].forEach(visualization => (visualization.reconstructionModel = result[1].find(v => v.orkgOrigin === visualization.id)));
                    // filter out the visualization that doesn't exist;
                    const visDataObjects = result[0].filter(v => v.reconstructionModel);
                    setIsLoading(false);
                    setVisData(visDataObjects);
                });
            } else {
                setVisData([]);
                setIsLoading(false);
            }
        };
        fetchVisualizationData();
        console.log('useEffect');
    }, [JSON.stringify(comparisonObject.visualizations)]);

    return (
        <div>
            {!isLoading && data && visData && visData.length > 0 && (
                <PreviewCarouselComponent>
                    {visData.map((data, index) => {
                        return (
                            <SingleVisualizationComponent
                                key={'singleVisComp_' + index}
                                input={data}
                                itemIndex={index}
                                expandVisualization={val => expandVisualization(val)}
                            />
                        );
                    })}
                </PreviewCarouselComponent>
            )}
            {isLoading && (
                <>
                    <ContentLoader
                        height={4}
                        width={50}
                        speed={2}
                        foregroundColor="#f3f3f3"
                        backgroundColor="#ecebeb"
                        style={{ borderRadius: '11px', margin: '10px 0' }}
                    >
                        <rect x="0" y="0" rx="0" ry="0" width="50" height="100" />
                    </ContentLoader>
                </>
            )}
        </div>
    );
}

export default PreviewVisualizationComparison;
