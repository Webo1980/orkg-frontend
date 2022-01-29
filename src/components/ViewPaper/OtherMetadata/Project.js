import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';

const Project = props => {
    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Project Information</ModalHeader>
            <ModalBody>
                {props.project && props.project.funder ? (
                    <div>
                        Funder: {props.project.funder}
                        <br />
                        Project: {props.project.project}
                    </div>
                ) : (
                    <div className="text-center mt-4 mb-4">No project</div>
                )}
            </ModalBody>
        </Modal>
    );
};

Project.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    project: PropTypes.array
};

export default Project;
