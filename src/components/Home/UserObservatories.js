import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { useDispatch } from 'react-redux';
import { updateAuth } from 'actions/auth';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';

const ObservatoryItem = styled.div`
    overflow: hidden;
    border-radius: 5px;
    margin-left: 4px;
`;

function UserObservatories(props) {
    const user = useSelector(state => state.auth.user);
    const [userObservatories, setUserObservatories] = useState([]);
    const [selectedObservatory, setSelectedObservatory] = useState(user.selectedObservatory);
    const dispatch = useDispatch();

    useEffect(() => {
        const findObservatoriesByUserId = async observatories => {
            await getObservatoryAndOrganizationInformation(observatories.observatoriesId, observatories.organizationsId).then(response => {
                setUserObservatories(response);
            });
        };
        findObservatoriesByUserId(props.observatories);
    }, [props.observatories]);

    const updateObservatory = async observatory => {
        const cookies = new Cookies();

        if (selectedObservatory) {
            setSelectedObservatory(false);
            dispatch(
                updateAuth({
                    user: {
                        ...user,
                        selectedObservatory: null
                    }
                })
            );
            cookies.remove('selected_observatory', { path: env('PUBLIC_URL') });
        } else {
            setSelectedObservatory(true);
            dispatch(
                updateAuth({
                    user: {
                        ...user,
                        selectedObservatory: { id: observatory.id, name: observatory.name, organization: observatory.organization.id }
                    }
                })
            );

            cookies.set(
                'selected_observatory',
                { id: observatory.id, name: observatory.name, organization: observatory.organization.id },
                { path: env('PUBLIC_URL') }
            );
        }
    };

    return (
        <>
            {userObservatories && (
                <>
                    <div
                        className="rounded-lg mt-2 col-12 d-flex align-items-center pt-2 pb-2 pr-2"
                        style={{
                            cursor: 'pointer',
                            backgroundColor: user.selectedObservatory && user.selectedObservatory.id ? '#424758' : '#5B6176'
                        }}
                        onClick={() => updateObservatory(userObservatories)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={0}
                    >
                        <p className="mt-2"> {userObservatories.name}</p>
                        {userObservatories.organization && (
                            <>
                                <ObservatoryItem style={{ marginLeft: 'auto' }}>
                                    <img
                                        height="50px"
                                        src={userObservatories.organization.logo}
                                        alt={`${userObservatories.organization.name} logo`}
                                    />
                                </ObservatoryItem>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

UserObservatories.propTypes = {
    observatories: PropTypes.object,
    updateAuth: PropTypes.func
};

export default UserObservatories;
