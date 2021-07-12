import { Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import moment from 'moment';
import { CLASSES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';

const ComparisonMetaData = () => {
    const comparisonObject = useSelector(state => state.comparison.object);

    return (
        <div>
            {comparisonObject.label ? (
                <>
                    {comparisonObject.description && (
                        <div style={{ lineHeight: 1.5 }} className="h6 mb-2">
                            {comparisonObject.description}
                        </div>
                    )}
                    <div>
                        {comparisonObject.created_at ? (
                            <span className="badge badge-light mr-2">
                                <Icon icon={faCalendar} className="text-primary" />{' '}
                                {comparisonObject.created_at ? moment(comparisonObject.created_at).format('MMMM') : ''}{' '}
                                {comparisonObject.created_at ? moment(comparisonObject.created_at).format('YYYY') : ''}
                            </span>
                        ) : (
                            ''
                        )}

                        {comparisonObject.authors && comparisonObject.authors.length > 0 && (
                            <>
                                {comparisonObject.authors.map((author, index) =>
                                    author?.classes?.includes(CLASSES.AUTHOR) ? (
                                        <Link className="p-0" to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} key={index}>
                                            <Badge color="light" className="mr-2 mb-2">
                                                <Icon icon={faUser} className="text-primary" /> {author.label}
                                            </Badge>
                                        </Link>
                                    ) : (
                                        <Badge color="light" className="mr-2 mb-2" key={index}>
                                            <Icon icon={faUser} className="text-secondary" /> {author.label}
                                        </Badge>
                                    )
                                )}
                            </>
                        )}
                    </div>
                    {comparisonObject.doi && (
                        <div>
                            {comparisonObject.doi && (
                                <div style={{ marginBottom: '20px', lineHeight: 1.5 }}>
                                    <small>
                                        DOI:{' '}
                                        <i>
                                            <ValuePlugins type="literal">{comparisonObject.doi}</ValuePlugins>
                                        </i>
                                    </small>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <br />
            )}
        </div>
    );
};

export default ComparisonMetaData;
