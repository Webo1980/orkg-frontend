import { useEffect, useState } from 'react';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getThing } from 'services/similarity';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import THING_TYPES from 'constants/thingTypes';

function VisualizationPreview({ id }) {
    const [visualizationModelForGDC, setVisualizationModelForGDC] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: id })
            .then(model => {
                setIsLoading(false);
                setIsLoadingFailed(false);
                setVisualizationModelForGDC(model);
            })
            .catch(() => {
                setIsLoading(false);
                setIsLoadingFailed(true);
                setVisualizationModelForGDC(undefined);
                toast.error('Error loading visualization preview');
            });
    }, [id]);

    return (
        <div>
            {isLoading && 'Loading...'}
            {!isLoading && !isLoadingFailed && visualizationModelForGDC && (
                <div className="p-3">
                    <GDCVisualizationRenderer height="500px" model={visualizationModelForGDC} />
                </div>
            )}
            {!isLoading && isLoadingFailed && (
                <div className="p-3">
                    <Alert color="warning">Error loading visualization preview</Alert>
                </div>
            )}
        </div>
    );
}

VisualizationPreview.propTypes = {
    id: PropTypes.string.isRequired,
};

export default VisualizationPreview;
