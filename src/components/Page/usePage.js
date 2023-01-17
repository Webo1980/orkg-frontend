import HistoryModal from 'components/HistoryModal/HistoryModal';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { isArray } from 'lodash';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Alert, Button } from 'reactstrap';
import * as Showdown from 'showdown';
import styled from 'styled-components';
import { reverseWithSlug } from 'utils';

const converter = new Showdown.Converter();
converter.setFlavor('github');

const Article = styled.div`
    h1 {
        font-size: 1.5rem;
    }
    h2 {
        font-size: 1.4rem;
    }
    h3 {
        font-size: 1.3rem;
    }
    h4 {
        font-size: 1.2rem;
    }
    h5 {
        font-size: 1.1rem;
    }
    h6 {
        font-size: 1.05rem;
    }
`;

const usePage = () => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [versions, setVersions] = useState([]);
    const [publishedVersionUrl, setPublishedVersionUrl] = useState('');

    const loadHistory = useCallback(async ({ versionId, currentId, historyPromise, historyRoute }) => {
        if (!versionId || !currentId) {
            return;
        }

        const fetchedVersions = await historyPromise(versionId);
        const _versions = fetchedVersions.data?.map(({ attributes, id }) => ({
            created_at: attributes.createdAt,
            created_by: attributes.createdBy.data.attributes.username,
            id,
            isSelected: id === currentId,
            link: reverseWithSlug(historyRoute, { id, slug: attributes.title }),
        }));
        const publishedVersion = fetchedVersions.data.find(version => version.attributes?.isVisibleInListView);
        setPublishedVersionUrl(reverseWithSlug(historyRoute, { id: publishedVersion.id, slug: publishedVersion.attributes?.title }));
        setVersions(_versions);
    }, []);

    const loadPage = useCallback(async ({ pagePromise, historyPromise = null, historyRoute }) => {
        setIsLoading(true);
        setIsNotFound(false);

        try {
            const _page = await pagePromise;
            const data = isArray(_page.data) ? _page.data[0] : _page.data;

            setPage({
                ...data,
                content: <Article dangerouslySetInnerHTML={{ __html: converter.makeHtml(data.attributes.content) }} />,
            });

            if (historyPromise) {
                loadHistory({ currentId: data?.id, historyPromise, versionId: data?.attributes.vuid, historyRoute });
            }
        } catch (e) {
            console.log(e);
            setIsNotFound(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const PageHistory = () => (
        <>
            {page?.attributes?.isVisibleInListView === false && (
                <Helmet>
                    <meta name="robots" content="noindex" /> {/* Don't index old versions of the page */}
                    <link rel="canonical" href={publishedVersionUrl} />
                </Helmet>
            )}

            <div className="text-muted d-flex justify-content-between align-items-center" style={{ fontSize: '95%' }}>
                <div>
                    <UserAvatar userId={page?.attributes?.createdBy?.data?.attributes?.username} /> Version {page?.attributes?.versionNumber}. Last
                    edited {moment(page?.attributes?.updatedAt).fromNow()}
                </div>
                <div>
                    <Button color="primary" size="sm" outline onClick={() => setIsOpenHistoryModal(true)}>
                        Page history
                    </Button>
                </div>
            </div>
            <hr />

            {page?.attributes?.isVisibleInListView === false && (
                <Alert color="warning" fade={false}>
                    This is an unpublished version. Go to the <Link to={publishedVersionUrl}>published version</Link>.
                </Alert>
            )}

            {isOpenHistoryModal && (
                <HistoryModal
                    show
                    title="Publish history"
                    id={page?.id}
                    versions={versions}
                    toggle={() => setIsOpenHistoryModal(v => !v)}
                    shouldHideFeaturedUnlisted
                />
            )}
        </>
    );

    return { page, isLoading, isNotFound, loadPage, PageHistory };
};

export default usePage;
