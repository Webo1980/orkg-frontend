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

const Datasets = props => {
    useEffect(() => {
        document.title = 'Paper Details';
        console.log(props);
    }, []);

    const getValue = e => {
        console.log(e);
    };

    return (
        <>
            <Container className="pb-8 mt-4 mb-4">
                <>
                    {props.objectInformation && (
                        <ListGroup>
                            {props.objectInformation ? (
                                <>
                                    {props.objectInformation.map(o => {
                                        return (
                                            <ContentCard
                                                objectInformation={{
                                                    id: o.doi,
                                                    title: o.titles[0].title,
                                                    authors: o.creators.map(c => {
                                                        return { name: c.givenName !== null ? c.givenName + ' ' + c.familyName : '', id: c.id };
                                                    })
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

Datasets.propTypes = {
    objectInformation: PropTypes.object
};

export default Datasets;
