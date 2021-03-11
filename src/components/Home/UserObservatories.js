import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { connect } from 'react-redux';
import { updateAuth } from 'actions/auth';
import { Cookies } from 'react-cookie';

const ResourceItem = styled.div`
    overflow: hidden;
    border-radius: 5px;
    margin-left: 4px;
`;

function UserObservatories(props) {
    const user = useSelector(state => state.auth.user);
    const [userObservatories, setUserObservatories] = useState([]);
    const [selectedObservatory, setSelectedObservatory] = useState(user.selected_observatory ? true : false);

    useEffect(() => {
        console.log(user);
        const findObservatoriesByUserId = async observatories => {
            await getObservatoryAndOrganizationInformation(observatories.observatories_id, observatories.organizations_id).then(response => {
                setUserObservatories(response);
            });
        };
        findObservatoriesByUserId(props.observatories);
    }, [props.observatories]);

    const updateObservatory = async observatory => {
        console.log(selectedObservatory);
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;

        if (selectedObservatory) {
            setSelectedObservatory(false);
            await props.updateAuth({
                user: {
                    ...user,
                    selected_observatory: null
                }
            });
            cookies.remove('selected_observatory');
            cookies.remove('observatory_name');
        } else {
            setSelectedObservatory(true);
            await props.updateAuth({
                user: {
                    ...user,
                    selected_observatory: { id: observatory.id, name: observatory.name }
                }
            });
            cookies.set('selected_observatory', observatory.id);
            cookies.set('observatory_name', observatory.name);
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
                            backgroundColor: user.selected_observatory && user.selected_observatory.id ? '#424758' : '#5B6176'
                        }}
                        onClick={() => updateObservatory(userObservatories)}
                    >
                        {userObservatories.name}
                        {userObservatories.organization && (
                            <>
                                <ResourceItem key="1" style={{ marginLeft: '168px' }}>
                                    <img
                                        height="50px"
                                        src={userObservatories.organization.logo}
                                        alt={`${userObservatories.organization.name} logo`}
                                    />
                                </ResourceItem>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

const mapDispatchToProps = dispatch => ({
    updateAuth: data => dispatch(updateAuth(data))
});

UserObservatories.propTypes = {
    observatories: PropTypes.object,
    updateAuth: PropTypes.func.isRequired
};

export default connect(
    null,
    mapDispatchToProps
)(UserObservatories);
