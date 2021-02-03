import { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Statements from 'components/StatementBrowser/StatementBrowser';
import SameAsStatements from 'pages/SameAsStatements';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { updateSettings } from 'actions/statementBrowser';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

class StatementBrowserDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // clone the original value of openExistingResourcesInDialog
            previousOpenExistingResourcesInDialog: Boolean(JSON.stringify(props.openExistingResourcesInDialog))
        };
    }

    render() {
        return (
            <Modal
                isOpen={this.props.show}
                toggle={this.props.toggleModal}
                size="lg"
                onExit={() => {
                    // return the original value of openExistingResourcesInDialog
                    this.props.updateSettings({
                        openExistingResourcesInDialog: this.state.previousOpenExistingResourcesInDialog
                    });
                }}
            >
                <ModalHeader toggle={this.props.toggleModal}>
                    <span style={{ marginRight: 170, display: 'inline-block' }}>
                        {this.props.newStore
                            ? `View existing ${this.props.type}: ${this.props.label}`
                            : `View ${this.props.type}: ${this.props.label}`}
                    </span>
                    {this.props.newStore && (
                        <Link
                            style={{ right: 45, position: 'absolute', top: 12 }}
                            title={`Go to ${this.props.type} page`}
                            className="ml-2"
                            to={reverse(this.props.type === 'resource' ? ROUTES.RESOURCE : ROUTES.PROPERTY, { id: this.props.id })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button color="link" className="p-0">
                                Open {this.props.type} <Icon icon={faExternalLinkAlt} className="mr-1" />
                            </Button>
                        </Link>
                    )}
                </ModalHeader>
                <ModalBody>
                    <Statements
                        rootNodeType={this.props.type === 'resource' ? 'resource' : 'predicate'}
                        enableEdit={this.props.enableEdit}
                        syncBackend={this.props.syncBackend}
                        initialSubjectId={this.props.id}
                        initialSubjectLabel={this.props.label}
                        openExistingResourcesInDialog={false}
                        newStore={this.props.newStore}
                    />

                    <SameAsStatements />
                </ModalBody>
            </Modal>
        );
    }
}

StatementBrowserDialog.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    newStore: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    updateSettings: PropTypes.func.isRequired,
    type: PropTypes.string
};

StatementBrowserDialog.defaultProps = {
    newStore: true,
    enableEdit: false,
    syncBackend: false,
    type: 'resource'
};

const mapStateToProps = state => {
    return { openExistingResourcesInDialog: state.statementBrowser.openExistingResourcesInDialog };
};

const mapDispatchToProps = dispatch => ({
    updateSettings: data => dispatch(updateSettings(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementBrowserDialog);
