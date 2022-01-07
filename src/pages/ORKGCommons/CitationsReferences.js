import React, { useEffect, useState } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import ContentCard from './ContentCard';

const PaperCardStyled = styled.div`
    & .options {
        visibility: hidden;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        visibility: visible;
    }
`;

const CitationsReferences = props => {
    useEffect(() => {
        document.title = 'Paper Details';
        console.log(props);
    }, []);

    const getValue = e => {
        console.log(e);
    };

    return (
        <>
            <Container className="pb-4 mt-2 mb-4">
                <>
                    {props.objectInformation && (
                        <ListGroup>
                            {props.objectInformation ? (
                                <>
                                    {props.objectInformation.map(o => {
                                        console.log(o);
                                        return (
                                            <ContentCard
                                                objectInformation={{
                                                    id: o.doi,
                                                    title: o.title
                                                }}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="text-center mt-4 mb-4">No Datasets</div>
                            )}
                        </ListGroup>
                    )}
                </>
            </Container>
        </>
    );
};

CitationsReferences.propTypes = {
    objectInformation: PropTypes.object
};

export default CitationsReferences;
