import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Input, InputGroup, InputGroupAddon, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { createShortLink, getComparison } from 'services/similarity/index';
import ShareCreatedContent from 'components/ShareLinkMarker/ShareCreatedContent';
import { setComparisonConfigurationAttribute, setComparisonShortLink, getComparisonURLConfig } from 'actions/comparison';
import { useSelector, useDispatch } from 'react-redux';
import { getPublicUrl } from 'utils';
import { slugify } from 'utils';
import { toast } from 'react-toastify';

const Share = ({ showDialog, toggle }) => {
    const [shortLinkIsLoading, setShortLinkIsLoading] = useState(false);
    const [shortLinkIsFailed, setShortLinkIsFailed] = useState(false);

    const dispatch = useDispatch();
    const { id, researchField } = useSelector(state => state.comparison.object);
    const shortLink = useSelector(state => state.comparison.shortLink);
    const { contributionsList, responseHash, comparisonType } = useSelector(state => state.comparison.configuration);
    const comparisonURLConfig = useSelector(state => getComparisonURLConfig(state.comparison));

    const generateShortLink = async () => {
        setShortLinkIsLoading(true);
        setShortLinkIsFailed(false);
        if (id && responseHash) {
            dispatch(setComparisonShortLink(`${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: id })}`));
            setShortLinkIsLoading(false);
            setShortLinkIsFailed(false);
        } else {
            let link = ``;
            if (!responseHash) {
                const saveComparison = await getComparison({
                    contributionIds: contributionsList,
                    type: comparisonType,
                    save_response: true
                });
                link = `${getPublicUrl()}${reverse(ROUTES.COMPARISON)}${comparisonURLConfig}&response_hash=${saveComparison.response_hash}`;
                dispatch(setComparisonConfigurationAttribute('responseHash', saveComparison.response_hash));
            } else {
                link = `${getPublicUrl()}${reverse(ROUTES.COMPARISON)}${comparisonURLConfig}`;
            }
            createShortLink({
                long_url: link
            })
                .then(data => {
                    const nshortLink = `${getPublicUrl()}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                    dispatch(setComparisonShortLink(nshortLink));
                    setShortLinkIsLoading(false);
                    setShortLinkIsFailed(false);
                })
                .catch(() => {
                    setShortLinkIsLoading(false);
                    setShortLinkIsFailed(true);
                    dispatch(setComparisonShortLink(link));
                });
        }
    };

    return (
        <Modal
            onOpened={() => {
                if (!shortLink) {
                    generateShortLink();
                }
            }}
            isOpen={showDialog}
            toggle={toggle}
        >
            <ModalHeader toggle={toggle}>Share link</ModalHeader>
            <ModalBody>
                <p>The created comparison can be shared using the following link: </p>

                <InputGroup>
                    <Input value={!shortLinkIsLoading ? shortLink : 'Loading share link...'} disabled />
                    <InputGroupAddon addonType="append">
                        <CopyToClipboard
                            text={!shortLinkIsLoading ? shortLink : 'Loading share link...'}
                            onCopy={() => {
                                toast.success('Share link copied!');
                            }}
                        >
                            <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                <Icon icon={faClipboard} />
                            </Button>
                        </CopyToClipboard>
                    </InputGroupAddon>
                </InputGroup>

                {!shortLinkIsLoading && (
                    <ShareCreatedContent
                        typeOfLink="comparison"
                        title={`An @orkg_org comparison in the area of ${researchField?.label ? `%23${slugify(researchField.label)}` : ''}`}
                    />
                )}

                {shortLinkIsFailed && (
                    <Alert color="light" className="mb-0 mt-1">
                        Failed to create a short link, please try again later
                    </Alert>
                )}
            </ModalBody>
        </Modal>
    );
};

Share.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default Share;
