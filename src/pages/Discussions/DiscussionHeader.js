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

    const loadDiscussionData = (label, type = props.type) => {
        const id = label
            .replace(/\s+/g, '-')
            .replace(/[*+~%\\<>/;.(){}?,'"!:@|]/g, '')
            .toLowerCase();
        setIsLoadingDiscussion(true);

        if (type === 'observatory') {
            getObservatoryDiscussion(id)
                .then(comments => {
                    setDiscussionList(comments.post_stream.posts);
                    setIsLoadingDiscussion(false);
                })
                .catch(error => {
                    setIsLoadingDiscussion(false);
                });
        } else if (type === ENTITIES.RESOURCE) {
            getResourceDiscussion(id)
                .then(comments => {
                    setDiscussionList(comments.post_stream.posts);
                    setIsLoadingDiscussion(false);
                })
                .catch(error => {
                    setIsLoadingDiscussion(false);
                });
        }
    };

    useEffect(() => {
        loadDiscussionData(props.label, props.type);
    }, [props.label, props.type]);

    const updateMetadata = comments => {
        loadDiscussionData(comments.topic_slug);
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
                    id={props.id}
                    updateMetadata={updateMetadata}
                />
            )}
        </>
    );
};

DiscussionHeader.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
};

export default DiscussionHeader;
