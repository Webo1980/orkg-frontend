import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import DiscussionCard from 'components/DiscussionCard/DiscussionCard';
import { createResourceDiscourseTopic } from 'services/backend/resources';
import { createObservatoryDiscourseTopic } from 'services/backend/observatories';
import { ENTITIES } from 'constants/graphSettings';
import env from '@beam-australia/react-env';

const Discussion = props => {
    const [creatingTopic, setCreatingTopic] = useState(false);

    const handleParticipate = async () => {
        if (props.comments.length === 0) {
            setCreatingTopic(true);
            let response = '';
            if (props.type === 'observatory') {
                response = await createObservatoryDiscourseTopic(
                    props.id,
                    props.label,
                    `This topic provides detailed dicussion about ${props.label}`
                );
            } else if (props.type === ENTITIES.RESOURCE) {
                response = await createResourceDiscourseTopic(props.id, props.label, `This topic provides detailed dicussion about ${props.label}`);
            }
            if (response) {
                const a = document.createElement('a');
                a.target = '_blank';
                a.href = `${env('DISCOURSE_URL')}t/${response.topic_slug}/${response.topic_id}`;
                a.click();
                setCreatingTopic(false);
                props.toggle();
                props.updateMetadata(response);
            } else {
                toast.error('Discussion cannot be joined');
                setCreatingTopic(false);
                return null;
            }
        } else {
            const a = document.createElement('a');
            a.target = '_blank';
            a.href = `${env('DISCOURSE_URL')}t/${props.comments[0].topic_slug}/${props.comments[0].topic_id}`;
            a.click();
            setCreatingTopic(false);
            props.toggle();
        }
    };

    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>
                    {`${props.label} Discussion`}
                    <small className="text-muted ml-2 mt-1"> {props.comments.length} comments </small>
                </ModalHeader>
                <ModalBody>
                    <>
                        {' '}
                        {/* {!isLoadingDiscussion && ( */}
                        <ListGroup>
                            {props.comments.length > 0 ? (
                                <>
                                    {props.comments.slice(0, 5).map(c => {
                                        return <DiscussionCard comment={c} key={`p${c.id}`} />;
                                    })}
                                </>
                            ) : (
                                <div className="text-center mt-4 mb-4">No discussion found!</div>
                            )}
                        </ListGroup>
                        {/* )} */}
                        {/* {isLoadingDiscussion && ( */}
                        {/* <div className="text-center mt-4 mb-4 p-5 container box rounded"> */}
                        {/* <div className="text-left"> */}
                        {/* <ContentLoader */}
                        {/* speed={2} */}
                        {/* width={400} */}
                        {/* height={50} */}
                        {/* viewBox="0 0 400 50" */}
                        {/* style={{ width: '100% !important' }} */}
                        {/* backgroundColor="#f3f3f3" */}
                        {/* foregroundColor="#ecebeb" */}
                        {/* > */}
                        {/* <rect x="0" y="0" rx="3" ry="3" width="400" height="20" /> */}
                        {/* <rect x="0" y="25" rx="3" ry="3" width="300" height="20" /> */}
                        {/* </ContentLoader> */}
                        {/* </div> */}
                        {/* </div> */}
                        {/* )} */}
                    </>
                </ModalBody>
                <ModalFooter>
                    <div className="text-align-center mt-2">
                        <Button color="primary" disabled={creatingTopic} className="float-right" onClick={handleParticipate}>
                            {creatingTopic && <span className="fa fa-spinner fa-spin" />} Participate
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
    label: PropTypes.string.isRequired,
    comments: PropTypes.array.isRequired,
    type: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    updateMetadata: PropTypes.func
};

export default Discussion;
