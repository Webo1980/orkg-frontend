import { useState, useEffect } from 'react';
import { ButtonGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import { getSimilarPapers } from 'services/SemanticScholar';
import ContentLoader from 'react-content-loader';

const SimilarPapers = props => {
    const [isLoadingPapers, setIsLoadingPapers] = useState(null);
    const [papers, setPapers] = useState([]);

    const loadPapers = problem => {
        setIsLoadingPapers(true);
        getSimilarPapers(problem)
            .then(papers => {
                console.log(papers);
                setPapers(papers);
                setIsLoadingPapers(false);
            })
            .catch(error => {
                console.log(error);
                setIsLoadingPapers(false);
            });
    };

    useEffect(() => {
        loadPapers(props.problem);
    }, [props.problem]);

    return (
        <>
            {!isLoadingPapers && papers && (
                <>
                    <ButtonGroup className="flex-shrink-0" style={{ marginLeft: 1, marginRight: 2 }}>
                        khkhkjhk
                    </ButtonGroup>
                </>
            )}

            {isLoadingPapers && (
                <div>
                    <ContentLoader
                        height="100%"
                        width="100%"
                        viewBox="0 0 100 10"
                        style={{ width: '100% !important' }}
                        speed={2}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                    >
                        <rect x="0" y="0" rx="2" ry="2" width="32" height="10" />
                        <rect x="33" y="0" rx="2" ry="2" width="32" height="10" />
                        <rect x="66" y="0" rx="2" ry="2" width="32" height="10" />
                    </ContentLoader>
                </div>
            )}
        </>
    );
};

SimilarPapers.propTypes = {
    problem: PropTypes.string.isRequired
};

export default SimilarPapers;
