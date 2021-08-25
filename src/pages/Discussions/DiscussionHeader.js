import { useState, useEffect } from 'react';
import { Button, ButtonGroup, Badge } from 'reactstrap';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Discussion from 'pages/Discussions/Discussion';
import { getResourceDiscussion } from 'services/backend/resources';
import { getObservatoryDiscussion } from 'services/backend/observatories';
import PropTypes from 'prop-types';
import { ENTITIES } from 'constants/graphSettings';

const DiscussionHeader = props => {
    const [showDiscussionDialog, setShowDiscussionDialog] = useState(false);
    const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(null);
    const [discussionList, setDiscussionList] = useState([]);
    const [topicId, setTopicId] = useState(topicId ? topicId : props.topicId);

    const loadDiscussionData = (type = props.type) => {
        setIsLoadingDiscussion(true);
        console.log(topicId);
        if (type === 'observatory' && topicId != 0) {
            getObservatoryDiscussion(topicId)
                .then(comments => {
                    setDiscussionList(comments.post_stream.posts);
                })
                .catch(error => {
                    console.log(error);
                });
        } else if (type === ENTITIES.RESOURCE && topicId != 0) {
            getResourceDiscussion(topicId)
                .then(comments => {
                    setDiscussionList(comments.post_stream.posts);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        setIsLoadingDiscussion(false);
    };

    useEffect(() => {
        loadDiscussionData(props.type);
    }, [props.type]);

    const updateMetadata = comments => {
        setTopicId(comments.topic_id);
        loadDiscussionData();
    };

    return (
        <>
            {!isLoadingDiscussion && discussionList && (
                <>
                    <ButtonGroup className="flex-shrink-0" style={{ marginLeft: 1, marginRight: 2 }}>
                        <Button color="secondary" size="sm" onClick={() => setShowDiscussionDialog(v => !v)}>
                            <Icon icon={faComments} /> Discussion
                            <small>
                                <Badge style={{ backgroundColor: 'darkGrey', marginLeft: '5px' }}>{discussionList.length}</Badge>
                            </small>
                        </Button>
                    </ButtonGroup>
                </>
            )}

            {props.label && (
                <Discussion
                    showDialog={showDiscussionDialog}
                    toggle={() => setShowDiscussionDialog(v => !v)}
                    label={props.label}
                    comments={discussionList}
                    type={props.type}
                    topicId={props.topicId}
                    objId={props.objId}
                    updateMetadata={updateMetadata}
                />
            )}
        </>
    );
};

DiscussionHeader.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    topicId: PropTypes.string.isRequired,
    objId: PropTypes.string.isRequired
};

export default DiscussionHeader;
