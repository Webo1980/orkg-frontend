import ContentLoader from 'react-content-loader';
import useContributors from 'components/TopContributors/hooks/useContributors';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import PropTypes from 'prop-types';
import ContributorsDropdownFilter from './ContributorsDropdownFilter';

const ContributorsModal = ({ researchFieldId, openModal, setOpenModal, initialSort = 'top', initialIncludeSubFields = true }) => {
    const { contributors, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useContributors({
        researchFieldId,
        pageSize: 30,
        initialSort,
        initialIncludeSubFields
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>
                <Icon icon={faAward} className="text-primary" /> {sort === 'top' ? 'Top 30 ' : ''}Contributors
                <div style={{ display: 'inline-block', marginLeft: '20px' }}>
                    <ContributorsDropdownFilter
                        sort={sort}
                        isLoading={isLoading}
                        includeSubFields={includeSubFields}
                        setSort={setSort}
                        setIncludeSubFields={setIncludeSubFields}
                    />
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="pl-3 pr-3">
                    {!isLoading &&
                        contributors.map((contributor, index) => {
                            return (
                                <div className="pt-2 pb-2" key={`rp${index}`}>
                                    <div className="d-flex">
                                        {sort === 'top' && <div className="pl-4 pr-4 pt-2">{index + 1}.</div>}
                                        <div>
                                            <ContributorCard
                                                contributor={{
                                                    ...contributor.profile,
                                                    subTitle: contributor?.counts?.total
                                                        ? `${contributor.counts.total} contribution${contributor.counts.total > 1 ? 's' : ''}`
                                                        : ''
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {contributors.length - 1 !== index && <hr className="mb-0 mt-3" />}
                                </div>
                            );
                        })}
                    {!isLoading && contributors?.length === 0 && (
                        <div className="mt-4 mb-4">
                            No contributors yet.
                            <i> Be the first contributor!</i>
                        </div>
                    )}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                                <rect x="30" y="5" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
                                <rect x="30" y="35" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="45" rx="3" ry="3" width="150" height="5" />
                                <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
                                <rect x="30" y="75" rx="3" ry="3" width="150" height="5" />
                                <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

ContributorsModal.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
    initialSort: PropTypes.string,
    initialIncludeSubFields: PropTypes.bool
};

export default ContributorsModal;
