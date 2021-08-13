import { useEffect, useState } from 'react';
import { getPapersCitations } from 'services/OpenCitations/OpenCitations';
import { faQuoteLeft, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { getPeerReviewInformation } from 'services/datacite';

const PaperMetrics = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [citations, setCitations] = useState(null);
    const [isPeerInfoLoading, setIsPeerInfoLoading] = useState(null);
    const [peerInfo, setPeerInfo] = useState(null);

    useEffect(async () => {
        const getCitations = doi => {
            setIsLoading(true);
            if (props.doi != '') {
                getPapersCitations(doi)
                    .then(response => {
                        //console.log(response);
                        setIsLoading(false);
                        setCitations(response[0].count);
                    })
                    .catch(e => {
                        //console.log(e);
                        setIsLoading(false);
                        setCitations(0);
                    });
            } else {
                setIsLoading(false);
                setCitations(0);
            }
        };

        const getPeerReviewInfo = doi => {
            setIsPeerInfoLoading(true);
            if (props.doi != '') {
                getPeerReviewInformation(doi)
                    .then(response => {
                        console.log(response);
                        setIsPeerInfoLoading(false);
                        setPeerInfo(response['data']['peerReview']['type']);
                    })
                    .catch(e => {
                        //console.log(e);
                        setIsPeerInfoLoading(false);
                        setPeerInfo('');
                    });
            } else {
                setIsPeerInfoLoading(false);
                setPeerInfo('');
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
        getCitations(props.doi);
        getPeerReviewInfo(props.doi);
    }, [props.doi]);

    return (
        <>
            {!isLoading && (
                <>
                    <Icon size="sm" icon={faQuoteLeft} className="ml-2 mr-1" />
                    Citations: {citations && citations}
                </>
            )}

            {!isPeerInfoLoading && peerInfo && (
                <>
                    <Icon size="sm" icon={faUserEdit} className="ml-2 mr-1" />
                    Peer reviewed
                </>
            )}
        </>
    );
};

PaperMetrics.propTypes = {
    doi: PropTypes.string
};

export default PaperMetrics;
