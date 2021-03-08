import { useState, useEffect } from 'react';
import { Row, Card, CardBody, CardTitle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';

const StyledOrganizationCard = styled.div`
    border: 0;
    .logoContainer {
        padding: 1rem;
        position: relative;
        display: block;

        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 150px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 150px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;

const ResourceItem = styled.div`
    overflow: hidden;
    border-radius: 5px;
    margin-left: 4px;
`;

const Img = styled.img`
    height: 50px;
`;

function UserObservatories(props) {
    const [userObservatories, setUserObservatories] = useState([]);

    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        const findObservatoriesByUserId = async observatories => {
            await getObservatoryAndOrganizationInformation(observatories.observatories_id, observatories.organizations_id).then(response => {
                setUserObservatories(response);
            });
        };
        findObservatoriesByUserId(props.observatories);
    }, [props.observatories]);

    return (
        <>
            {userObservatories && (
                <>
                    <div className="rounded-lg mt-2 col-12 d-flex align-items-center pt-2 pb-2 pr-2" style={{ backgroundColor: '#5B6176' }}>
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

UserObservatories.propTypes = {
    observatories: PropTypes.object
};

export default UserObservatories;
