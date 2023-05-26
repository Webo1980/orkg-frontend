import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from 'reactstrap';

/**
 * Redirection of the short link feature to the comparison page
 * The Short link feature is deprecated: https://gitlab.com/TIBHannover/orkg/orkg-simcomp/orkg-simcomp-api/-/issues/19
 */
const RedirectShortLinks = () => {
    const { shortCode } = useParams();
    const navigate = useNavigate();
    const [isLoading] = useState(true);

    useEffect(() => {
        navigate(`${reverse(ROUTES.COMPARISON, { comparisonId: shortCode })}?noResource=true`);
    }, [navigate, shortCode]);

    return (
        <>
            {isLoading && (
                <Container className="p-0 d-flex align-items-center">
                    <h1 className="h5 mt-4 mb-4 ">Redirection....</h1>
                </Container>
            )}
        </>
    );
};

export default RedirectShortLinks;
