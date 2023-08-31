import { useState, useEffect } from 'react';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Card, CardBody, CardText, CardTitle, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import StyledSlider from 'components/ResearchProblem/Benchmarks/styled';
import Confirm from 'components/Confirmation/Confirmation';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { activatedContributionsToList } from 'components/Comparison/hooks/helpers';
import { uniq, without } from 'lodash';
import { getSimilarPapers } from 'services/orkgSimpaper';

function RelatedPapersCarousel(props) {
    const contributionsList = useSelector(state => activatedContributionsToList(state.comparison.contributions));
    const [showAddContribution, setShowAddContribution] = useState(false);
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        centerMode: false,
        slidesToScroll: 5,
        nextArrow: <Icon icon={faArrowCircleRight} />,
        prevArrow: <Icon icon={faArrowCircleLeft} />,
        rows: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };
    const { id } = useSelector(state => state.comparison.comparisonResource);

    const responseHash = useSelector(state => state.comparison.configuration.responseHash);
    const isPublished = !!(id || responseHash);
    const [statements, setStatements] = useState([]);
    const [similarPapers, setSimilarPapers] = useState([]);

    const showConfirmDialog = () =>
        Confirm({
            title: 'This is a published comparison',
            message:
                'The comparison you are viewing is published, which means it cannot be modified. To make changes, fetch the live comparison data and try this action again',
            cancelColor: 'light',
            confirmText: 'Fetch live data',
        });

    /**
     * Add contributions
     *
     * @param {Array[String]} newContributionIds Contribution ids to add
     */
    const addContributions = newContributionIds => {
        const contributionsIDs = without(uniq(contributionsList.concat(newContributionIds)), undefined, null, '') ?? [];
        props.navigateToNewURL({ _contributionsList: contributionsIDs });
    };

    const handleAddContribution = async () => {
        if (isPublished) {
            if (await showConfirmDialog()) {
                props.navigateToNewURL({});
            }
            return;
        }
        setShowAddContribution(v => !v);
    };

    const fetchItems = async () => {
        // eslint-disable-next-line no-debugger

        // promise to prevent blocking loading of the additional paper data
        try {
            const similar = await getSimilarPapers({
                contributionIds: contributionsList,
                mode: 'DYNAMIC',
            });
            console.log('similarPapers', similar);
        } catch (error) {
            console.error('Error fetching similar papers:', error);
        }
    };
    useEffect(() => {
        fetchItems();
    }, []);

    const papers = [
        {
            id: '123',
            title: 'Title',
            authors: ['<NAME>'],
            year: '2019',
            doi: '10.1000/123456789',
        },
        {
            id: '456',
            title: 'Title',
            authors: ['<NAME>'],
            year: '2019',
            doi: '10.1000/123456789',
        },
        {
            id: '789',
            title: 'curat',
            authors: ['<NAME>'],
            year: '2019',
            doi: '10.1000/123456789',
        },
        {
            id: '789',
            title: 'curat',
            authors: ['<NAME>'],
            year: '2019',
            doi: '10.1000/123456789',
        },
        {
            id: '789',
            title: 'curat',
            authors: ['<NAME>'],
            year: '2019',
            doi: '10.1000/123456789',
        },
        {
            id: '789',
            title: 'curat',
            authors: ['<NAME>'],
            year: '2019',
            doi: '10.1000/123456789',
        },
    ];

    return (
        <div className="py-3">
            <ErrorBoundary fallback="Something went wrong while loading the visualization!">
                <>
                    <StyledSlider {...settings}>
                        {papers.map(paper => (
                            <div className="w-100 mx-1" key={paper.id}>
                                <Card>
                                    <CardBody style={{ height: '120px' }}>
                                        <CardTitle>
                                            <div>
                                                <div>{paper.title}</div>
                                                <div>
                                                    <Button
                                                        color="secondary"
                                                        outline
                                                        className="float-right"
                                                        onClick={() => handleAddContribution(setSimilarPapers(paper.title))}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardTitle>
                                    </CardBody>
                                </Card>
                            </div>
                        ))}
                    </StyledSlider>
                </>
            </ErrorBoundary>
            <AddContribution
                onAddContributions={addContributions}
                showDialog={showAddContribution}
                toggle={() => setShowAddContribution(v => !v)}
                similarPapers={similarPapers}
            />
        </div>
    );
}
RelatedPapersCarousel.propTypes = {
    navigateToNewURL: PropTypes.func.isRequired,
};
export default RelatedPapersCarousel;
