import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const TopicsCard = styled.div`
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
    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Topics</ModalHeader>
            <ModalBody>
                {props.topics && props.topics.length > 0 ? (
                    <div>
                        <>
                            {props.topics.map(o => {
                                return (
                                    <TopicsCard className="list-group-item list-group-item-action">
                                        {o.slice(0, 1).toUpperCase() + o.slice(1, o.length)}
                                    </TopicsCard>
                                );
                            })}
                        </>
                    </div>
                ) : (
                    <div className="text-center mt-4 mb-4">No topics</div>
                )}
            </ModalBody>
        </Modal>
    );
};

Topics.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    topics: PropTypes.array
};

export default Topics;
