import { Modal, ModalHeader, ModalBody, ListGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import ContentCard from './ContentCard';

const Citations = props => {
    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Citations</ModalHeader>
            <ModalBody>
                {props.citations && props.citations.length > 0 ? (
                    <ListGroup>
                        <>
                            {props.citations.map(o => {
                                return (
                                    <ContentCard
                                        paper={{
                                            id: o.doi,
                                            title: o.title
                                        }}
                                    />
                                );
                            })}
                        </>
                    </ListGroup>
                ) : (
                    <div className="text-center mt-4 mb-4">No Citations</div>
                )}
            </ModalBody>
        </Modal>
    );
};

Citations.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    citations: PropTypes.array
};

export default Citations;
