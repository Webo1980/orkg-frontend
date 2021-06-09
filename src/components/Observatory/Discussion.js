import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getDiscourseDiscussion, createDiscourseTopic } from 'services/backend/Discourse';
import DiscussionCard from 'components/ObservatoryCard/DiscussionCard';
import ContentLoader from 'react-content-loader';

const Discussion = props => {
    const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(null);
    const [discussionList, setDiscussionList] = useState([]);
    const [discussionMetadata, setDiscussionMetadata] = useState([]);

    useEffect(() => {
        const loadDiscussionData = label => {
            const id = label.replace(/\s+/g, '-').toLowerCase();
            setIsLoadingDiscussion(true);
            getDiscourseDiscussion(id)
                .then(comments => {
                    setDiscussionMetadata({ slug: comments.post_stream.posts[0].topic_slug, id: comments.post_stream.posts[0].topic_id });
                    setDiscussionList(comments.post_stream.posts);
                    setIsLoadingDiscussion(false);
                })
                .catch(error => {
                    setIsLoadingDiscussion(false);
                });
        };
        loadDiscussionData(props.label);
    }, [props.label]);

    const handleParticipate = async () => {
        if (!isLoadingDiscussion && discussionList.length == 0) {
            await createDiscourseTopic(props.label, `This topic provides detailed dicussion about ${props.label}`)
                .then(result => {
                    setDiscussionMetadata({ slug: result.topic_slug, id: result.topic_id });
                    const a = document.createElement('a');
                    a.target = '_blank';
                    a.href = `http://localhost:4200/t/${result.topic_slug}/${result.topic_id}`;
                    a.click();
                })
                .catch(error => {
                    toast.error('Discussion cannot be joined');
                    return null;
                });
        }
        if (discussionMetadata.slug && discussionMetadata.id) {
            const a = document.createElement('a');
            a.target = '_blank';
            a.href = `http://localhost:4200/t/${discussionMetadata.slug}/${discussionMetadata.id}`;
            a.click();
        }
    };

    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>{`${props.label} Discussion`}</ModalHeader>
                <ModalBody>
                    <>
                        {' '}
                        {!isLoadingDiscussion && (
                            <ListGroup>
                                {discussionList.length > 0 ? (
                                    <>
                                        {discussionList.map(resource => {
                                            return <DiscussionCard comment={resource} key={`p${resource.id}`} />;
                                        })}
                                    </>
                                ) : (
                                    <div className="text-center mt-4 mb-4">No discussion found!</div>
                                )}
                            </ListGroup>
                        )}
                        {isLoadingDiscussion && (
                            <div className="text-center mt-4 mb-4 p-5 container box rounded">
                                <div className="text-left">
                                    <ContentLoader
                                        speed={2}
                                        width={400}
                                        height={50}
                                        viewBox="0 0 400 50"
                                        style={{ width: '100% !important' }}
                                        backgroundColor="#f3f3f3"
                                        foregroundColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                        <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                                    </ContentLoader>
                                </div>
                            </div>
                        )}
                    </>
                </ModalBody>
                <ModalFooter>
                    <div className="text-align-center mt-2">
                        <Button color="primary" className="float-right" onClick={handleParticipate}>
                            Participate
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
};

Discussion.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
};

export default Discussion;
