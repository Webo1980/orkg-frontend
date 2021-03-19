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
        const findObservatoriesByUserId = async observatories => {
            await getObservatoryAndOrganizationInformation(observatories.observatories_id, observatories.organizations_id).then(response => {
                setUserObservatories(response);
            });
        };
        findObservatoriesByUserId(props.observatories);
    }, [props.observatories]);

    const updateObservatory = async observatory => {
        const cookies = new Cookies();

        if (selectedObservatory) {
            setSelectedObservatory(false);
            await props.updateAuth({
                user: {
                    ...user,
                    selected_observatory: null
                }
            });
            cookies.remove('selected_observatory');
        } else {
            setSelectedObservatory(true);
            await props.updateAuth({
                user: {
                    ...user,
                    selected_observatory: { id: observatory.id, name: observatory.name, organization: observatory.organization.id }
                }
            });

            cookies.set('selected_observatory', { id: observatory.id, name: observatory.name, organization: observatory.organization.id });
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
                        <p className="mt-2" style={{ minWidth: '200px' }}>
                            {userObservatories.name}
                        </p>
                        {userObservatories.organization && (
                            <>
                                <ResourceItem style={{ marginLeft: 'auto' }}>
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
