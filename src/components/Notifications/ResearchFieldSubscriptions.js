import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getRFTreeForNotifications, deleteSubscriptionStatus } from 'services/backend/notifications';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { resolveHookState } from 'react-use/lib/misc/hookState';

const ResearchFieldSubscriptions = () => {
    const user = useSelector(state => state.auth.user);
    const [subscribedList, setSubscribedList] = useState([]);
    useEffect(() => {
        console.log('test');
        getRFTreeForNotifications(user.id)
            .then(response => {
                console.log(response);
                setSubscribedList(response);
            })
            .catch(error => {
                console.log(error);
                toast.error('Error while fetching');
            });
    }, []);

    const removeSubscription = rField => {
        return deleteSubscriptionStatus(user.id, rField)
            .then(response => {
                console.log(response);
                setSubscribedList(response);
            })
            .catch(error => {
                toast.error('Error in deleting subscription');
            });
    };

    return (
        <div style={{ maxHeight: '600px', overflowY: 'scroll' }}>
            {subscribedList &&
                subscribedList.length > 0 &&
                subscribedList.map(rf => {
                    return (
                        <div key={rf.id} className="row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <div className="list-group-item column" style={{ flexBasis: '75%' }} key={rf.id}>
                                {rf.researchFieldName}
                            </div>
                            <div className="column" style={{ flexBasis: '25%' }}>
                                <Button className="ml-2" onClick={() => removeSubscription(rf.researchField)}>
                                    Unfollow
                                </Button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default ResearchFieldSubscriptions;
