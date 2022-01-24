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

const Topics = props => {
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
                    {props.objectInformation && props.objectInformation ? (
                        <div>
                            {props.objectInformation ? (
                                <>
                                    {props.objectInformation.topic.map(o => {
                                        return (
                                            <PaperCardStyled className="list-group-item list-group-item-action">
                                                {o.slice(0, 1).toUpperCase() + o.slice(1, o.length)}
                                            </PaperCardStyled>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="text-center mt-4 mb-4">No topics</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center mt-4 mb-4">No topics</div>
                    )}
                </>
            </Container>
        </>
    );
};

Topics.propTypes = {
    objectInformation: PropTypes.array
};

export default Topics;
