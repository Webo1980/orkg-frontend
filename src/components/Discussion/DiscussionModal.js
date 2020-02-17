import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

class DiscussionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDialog: false,
            openItem: 'title',
            isLoading: false
        };
    }

    toggleDialog = () => {
        if (!this.state.showDialog) {
            this.setState({
                showDialog: true,
                openItem: 'title'
            });
        } else {
            this.setState({
                showDialog: false
            });
        }
    };

    render() {
        return (
            <>
                <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }} onClick={this.toggleDialog}>
                    <Icon icon={faUsers} style={{ margin: '2px 4px 0 0' }} /> Discussion
                </Button>

                <Modal isOpen={this.state.showDialog} toggle={this.toggleDialog} size="lg">
                    <ModalHeader toggle={this.toggleDialog}>Discussion</ModalHeader>
                    <ModalBody>
                        <Alert color="info">
                            Please join the discussion about <em>{this.props.title}</em>
                        </Alert>
                    </ModalBody>
                </Modal>
            </>
        );
    }
}

DiscussionModal.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
};

export default DiscussionModal;
