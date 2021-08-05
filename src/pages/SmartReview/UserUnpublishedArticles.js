import { useEffect } from 'react';
import { faPlus, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';

const UserUnpublishedArticles = () => {
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        document.title = 'My unpublished articles - ORKG';
    });

    const renderListItem = article => (
        <ShortRecord key={article.id} header={article.label} href={reverse(ROUTES.SMART_REVIEW, { id: article.id })}>
            <div className="time">
                <Icon size="sm" icon={faCalendar} className="mr-1" /> {article.created_at ? moment(article.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        const { content: resources, last, totalElements } = await getResourcesByClass({
            id: resourceClass,
            page,
            items: pageSize,
            sortBy: 'created_at',
            creator: user.id,
            desc: true
        });

        if (resources.length) {
            return Promise.all(
                resources.map(resource => getStatementsByObjectAndPredicate({ objectId: resource.id, predicateId: PREDICATES.HAS_PAPER }))
            )
                .then(resourcesStatements =>
                    resourcesStatements.map((statements, idx) => {
                        if (!statements.length) {
                            return resources[idx];
                        }
                        return null;
                    })
                )
                .then(unpublishedItems => {
                    const items = unpublishedItems.filter(v => v);
                    return {
                        items: items,
                        last,
                        totalElements: items.length
                    };
                });
        } else {
            return {
                items: [],
                last,
                totalElements
            };
        }
    };

    const buttons = (
        <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.SMART_REVIEW_NEW}>
            <Icon icon={faPlus} /> Create article
        </RequireAuthentication>
    );

    return (
        <>
            <ListPage
                label="unpublished SmartReviews"
                resourceClass={CLASSES.SMART_REVIEW}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                buttons={buttons}
                pageSize={50}
            />
        </>
    );
};

export default UserUnpublishedArticles;
