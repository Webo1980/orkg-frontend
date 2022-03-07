import { useState, useEffect, useRef } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getUsersByObservatoryId } from 'services/backend/observatories';
import { deleteUserFromObservatoryById } from 'services/backend/users';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AddMember from 'components/Observatory/AddMember';
import { toast } from 'react-toastify';

const MembersBox = ({ observatoryId, organizationsList }) => {
    const user = useSelector(state => state.auth.user);
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
    const [userData, setUserData] = useState('');

    useEffect(() => {
        setUserData(user);
        const loadMembers = () => {
            setIsLoadingMembers(true);
            getUsersByObservatoryId(observatoryId)
                .then(contributors => {
                    setMembers(contributors);
                    setIsLoadingMembers(false);
                })
                .catch(error => {
                    setIsLoadingMembers(false);
                });
        };
        loadMembers();
    }, [observatoryId, user]);

    const updateObservatoryMembers = member => {
        const membersList = [member, ...members];
        setMembers(membersList);
    };

    const deleteObservatoryMember = async user => {
        await deleteUserFromObservatoryById(user.id)
            .then(_ => {
                const updatedList = members.filter(t => t !== user);
                setMembers(updatedList);
                toast.success('Member deleted successfully');
            })
            .catch(() => {
                toast.error(`error deleting a member`);
            });
    };

    return (
        <div className="box rounded-3 p-4 flex-grow-1">
            <h5>Members</h5>
            {!!user && user.isCurationAllowed && (
                <Button outline size="sm" style={{ float: 'right', marginTop: '-33px' }} onClick={() => setShowAddMemberDialog(v => !v)}>
                    <Icon icon={faPlus} /> Add
                </Button>
            )}
            <div className="flex-grow-1">
                {!isLoadingMembers ? (
                    <div className="mt-3">
                        {members.length > 0 ? (
                            <div>
                                {members.slice(0, 4).map((user, index) => {
                                    return (
                                        <div key={`oc${index}`}>
                                            <ContributorCard
                                                contributor={{
                                                    ...user,
                                                    subTitle: organizationsList.find(o => o.id.includes(user.organization_id))?.name
                                                }}
                                                options={
                                                    userData && userData.isCurationAllowed
                                                        ? {
                                                              label: 'Delete this member from the observatory',
                                                              action: () => deleteObservatoryMember(user),
                                                              icon: faTrash,
                                                              requireConfirmation: true
                                                          }
                                                        : ''
                                                }
                                            />
                                            {members.slice(0, 4).length - 1 !== index && <hr style={{ width: '90%', margin: '10px auto' }} />}
                                        </div>
                                    );
                                })}
                                {!isLoadingMembers && members?.length > 4 && (
                                    <div className="text-center mt-3">
                                        <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                                            View more
                                        </Button>
                                        {openModal && (
                                            <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
                                                <ModalHeader toggle={() => setOpenModal(v => !v)}>Observatory members</ModalHeader>
                                                <ModalBody>
                                                    <div className="clearfix">
                                                        {members.map((user, index) => {
                                                            return (
                                                                <div key={`moc${index}`}>
                                                                    <ContributorCard
                                                                        contributor={{
                                                                            ...user,
                                                                            subTitle: organizationsList.find(o => o.id.includes(user.organization_id))
                                                                                ?.name
                                                                        }}
                                                                        options={
                                                                            userData && userData.isCurationAllowed
                                                                                ? {
                                                                                      label: 'Delete this member from the observatory',
                                                                                      action: () => deleteObservatoryMember(user),
                                                                                      icon: faTrash,
                                                                                      requireConfirmation: true
                                                                                  }
                                                                                : ''
                                                                        }
                                                                    />
                                                                    {members.length - 1 !== index && (
                                                                        <hr style={{ width: '90%', margin: '10px auto' }} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ModalBody>
                                            </Modal>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center mt-4 mb-4">No members in this observatory yet.</div>
                        )}
                    </div>
                ) : (
                    <div className="text-center mt-4 mb-4">Loading members ...</div>
                )}

                <AddMember
                    showDialog={showAddMemberDialog}
                    toggle={() => setShowAddMemberDialog(v => !v)}
                    id={observatoryId}
                    organizationsList={organizationsList}
                    updateObservatoryMembers={updateObservatoryMembers}
                />
            </div>
        </div>
    );
};

MembersBox.propTypes = {
    observatoryId: PropTypes.string.isRequired,
    organizationsList: PropTypes.array.isRequired
};

export default MembersBox;
