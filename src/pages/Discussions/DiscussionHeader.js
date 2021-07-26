import { useState, useEffect } from 'react';
import { Container, Button, ButtonGroup } from 'reactstrap';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Discussion from 'pages/Discussions/Discussion';
import { getDiscourseDiscussion } from 'services/backend/Discourse';
import PropTypes from 'prop-types';

const DiscussionHeader = props => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDiscussionDialog, setShowDiscussionDialog] = useState(false);
    const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(null);
    const [discussionList, setDiscussionList] = useState([]);

    useEffect(() => {
        const loadDiscussionData = label => {
            const id = label.replace(/\s+/g, '-').toLowerCase();
            setIsLoadingDiscussion(true);
            getDiscourseDiscussion(id)
                .then(comments => {
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
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && discussionList && (
                <>
                    <ButtonGroup className="flex-shrink-0" style={{ marginRight: 2 }}>
                        <Button color="secondary" size="sm" onClick={() => setShowDiscussionDialog(v => !v)}>
                            <Icon icon={faClipboardList} /> Discussion:
                            <small>
                                <i> {`${discussionList.length} comment(s)`} </i>
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
