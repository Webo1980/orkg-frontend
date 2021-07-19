import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const ObservatoryBoxStyled = styled.div`
    float: right;
    border: 2px solid ${props => props.theme.light};
    border-radius: 5px;
    display: flex;
    padding: 5px 20px;
    align-items: center;
    max-width: 40%;
    margin: 0 -25px 0 0;
    flex-direction: column;
    font-size: 95%;
    max-width: 200px;
    flex-shrink: 0;
    transition: background-color 0.2s;

    &:hover {
        border: 2px solid ${props => props.theme.secondary};
    }
`;

const ObservatoryBox = () => {
    const provenance = useSelector(state => state.comparison.provenance ?? null);

    if (!provenance || !provenance.organization) {
        return null;
    }

    return (
        <ObservatoryBoxStyled>
            <Link to={reverse(ROUTES.OBSERVATORY, { id: provenance.id })} className="text-center">
                {provenance.organization.logo && (
                    <img
                        className="p-2"
                        src={provenance.organization.logo}
                        alt={`${provenance.organization.name} logo`}
                        style={{ maxWidth: 200, maxHeight: 60 }}
                    />
                )}

                {provenance && <div>{provenance.name}</div>}
            </Link>
        </ObservatoryBoxStyled>
    );
};

export default ObservatoryBox;
