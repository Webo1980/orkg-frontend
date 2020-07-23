import { Container, Row, Form, FormGroup, Label, Input, Button, TabContent, TabPane, Alert } from 'reactstrap';
import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getUserInformation, updateUserInformation } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { updateAuth } from '../../actions/auth';
import { toast } from 'react-toastify';

export const StyledSettingsMenu = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;

    > li {
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-radius: ${props => props.theme.borderRadius};

        > span {
            cursor: pointer;
        }
        &.active,
        &:hover {
            background: ${props => props.theme.orkgPrimaryColor};
            color: #fff;
            cursor: initial !important;
        }
        &.active a {
            color: #fff;
        }
    }
`;

class UserSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'general',
            displayName: '',
            email: '',
            organization: '',
            bio: '',
            password: '',
            newPassword: '',
            confirmNewPassword: '',
            loading: false,
            error: null
        };
    }

    componentDidMount() {
        this.getUserInformation();
    }

    getUserInformation = async () => {
        const userData = await getUserInformation();

        this.setState({
            displayName: userData.display_name,
            email: userData.email
        });
    };

    toggleTab = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSave = async () => {
        const { email, displayName } = this.state;

        if (!email || !displayName) {
            this.setState({
                error: 'Please fill out all fields'
            });
        }

        this.setState({
            loading: true
        });

        try {
            await updateUserInformation({
                email,
                displayName
            });
        } catch (err) {
            /*
      TODO: enable this code, but backend is currently returning an error
      this.setState({
        error: 'Something went wrong, please try again',
        loading: false,
      });
      return;*/
        }
        toast.success('Your changes have been saved successfully');

        this.props.updateAuth({ user: { displayName: displayName } });

        this.setState({
            loading: false
        });
    };

    render = () => (
        <>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Account Settings</h1>
            </Container>
            <Container className="p-0">
                <Row>
                    <div className="col-4 justify-content-center">
                        <Container className="box rounded p-3">
                            <StyledSettingsMenu>
                                <li
                                    onClick={() => {
                                        this.toggleTab('general');
                                    }}
                                    className={classnames({
                                        active: this.state.activeTab === 'general' || this.state.activeTab === 'delete'
                                    })}
                                >
                                    <span>General settings</span>
                                </li>
                                <li
                                    className={classnames({ active: this.state.activeTab === 'password' })}
                                    onClick={() => {
                                        this.toggleTab('password');
                                    }}
                                >
                                    <span>Password</span>
                                </li>
                            </StyledSettingsMenu>
                        </Container>
                    </div>
                    <div className="col-8 justify-content-center">
                        <TabContent className="box rounded pt-4 pb-3 pl-5 pr-5" activeTab={this.state.activeTab}>
                            <TabPane tabId="general">
                                <h5 className="mb-4">General account settings</h5>
                                {this.state.error && <Alert color="danger">{this.state.error}</Alert>}
                                <Form>
                                    <FormGroup>
                                        <Label for="displayName">Display name</Label>
                                        <Input
                                            onChange={this.handleInputChange}
                                            value={this.state.displayName}
                                            type="email"
                                            name="displayName"
                                            id="displayName"
                                            placeholder="Display name"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="Email">Email address</Label>
                                        <Input
                                            onChange={this.handleInputChange}
                                            value={this.state.email}
                                            type="email"
                                            name="email"
                                            id="Email"
                                            placeholder="Email address"
                                        />
                                    </FormGroup>
                                    {/*<FormGroup>
                    <Label for="organization">Organization</Label>
                    <Input
                      onChange={this.handleInputChange}
                      value={this.state.organization}
                      type="text"
                      name="organization"
                      id="organization"
                      placeholder="Organization"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="bio">Bio</Label>
                    <Input
                      onChange={this.handleInputChange}
                      value={this.state.bio}
                      type="textarea"
                      name="bio"
                      id="bio"
                      placeholder="Bio"
                    />
                  </FormGroup>*/}
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            this.handleSave();
                                        }}
                                        className="mt-4 mb-2"
                                    >
                                        {!this.state.loading ? (
                                            'Save changes'
                                        ) : (
                                            <span>
                                                <Icon icon={faSpinner} spin /> Loading
                                            </span>
                                        )}
                                    </Button>
                                    {/*<span
                    onClick={() => {
                      this.toggleTab('delete');
                    }}
                    className="pull-right mt-4 mb-2 text-danger btn"
                  >
                    Delete account
                  </span>*/}
                                </Form>
                            </TabPane>
                            <TabPane tabId="password">
                                <h5 className="mb-4">Change password</h5>
                                <Form>
                                    <FormGroup>
                                        <Label for="password">Current password</Label>
                                        <Input
                                            onChange={this.handleInputChange}
                                            value={this.state.password}
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="Current password"
                                        />
                                    </FormGroup>
                                    <Row>
                                        <div className="col-6">
                                            <FormGroup>
                                                <Label for="newPassword">New password</Label>
                                                <Input
                                                    onChange={this.handleInputChange}
                                                    value={this.state.newPassword}
                                                    type="password"
                                                    name="newPassword"
                                                    id="newPassword"
                                                    placeholder="New password"
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-6">
                                            <FormGroup>
                                                <Label for="confirmNewPassword">Repeat new password</Label>
                                                <Input
                                                    onChange={this.handleInputChange}
                                                    value={this.state.confirmNewPassword}
                                                    type="password"
                                                    name="confirmNewPassword"
                                                    id="confirmNewPassword"
                                                    placeholder="Confirm new password"
                                                />
                                            </FormGroup>
                                        </div>
                                    </Row>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            this.handleSave();
                                        }}
                                        className="mt-4 mb-2"
                                    >
                                        Save changes
                                    </Button>
                                </Form>
                            </TabPane>
                            <TabPane tabId="delete">
                                <h5 className="mb-4">Delete account</h5>

                                <Alert color="danger" className="mb-3">
                                    <b>Warning:</b> deleting your account is permanent and cannot be undone. If you are sure, please enter your
                                    password to delete your account
                                </Alert>

                                <Form>
                                    <FormGroup>
                                        <Label for="password">Your password</Label>
                                        <Input
                                            onChange={this.handleInputChange}
                                            value={this.state.password}
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="Your password"
                                        />
                                    </FormGroup>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            this.handleSave();
                                        }}
                                        className="mt-4 mb-2"
                                    >
                                        Delete account
                                    </Button>
                                </Form>
                            </TabPane>
                        </TabContent>
                    </div>
                </Row>
            </Container>
        </>
    );
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    updateAuth: data => dispatch(updateAuth(data))
});

UserSettings.propTypes = {
    updateAuth: PropTypes.func.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserSettings);
