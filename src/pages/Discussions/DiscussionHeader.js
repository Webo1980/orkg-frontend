import { useState, useEffect } from 'react';
import { Button, ButtonGroup, Badge } from 'reactstrap';
import { faClipboardList, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Discussion from 'pages/Discussions/Discussion';
import { getDiscourseDiscussion } from 'services/backend/Discourse';
import PropTypes from 'prop-types';

const DiscussionHeader = props => {
    const [showDiscussionDialog, setShowDiscussionDialog] = useState(false);
    const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(null);
    const [discussionList, setDiscussionList] = useState([]);

    useEffect(() => {
        const loadDiscussionData = label => {
            const id = label
                .replace(/\s+/g, '-')
                .replace(/[*+~%\\<>/;.(){}?,'"!:@\#\^|]/g, '')
                .toLowerCase();

            //console.log(id);
            setIsLoadingDiscussion(true);
            getDiscourseDiscussion(id)
                .then(comments => {
                    console.log(comments);
                    setDiscussionList(comments.post_stream.posts);
                    setIsLoadingDiscussion(false);
                })
                .catch(error => {
                    setIsLoadingDiscussion(false);
                });
        };
        loadDiscussionData(props.label);
    }, [props.label]);

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

            {props.label && <Discussion showDialog={showDiscussionDialog} toggle={() => setShowDiscussionDialog(v => !v)} label={props.label} />}
        </>
    );
};

DiscussionHeader.propTypes = {
    label: PropTypes.string.isRequired
};

export default DiscussionHeader;
