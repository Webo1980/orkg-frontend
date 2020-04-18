import React, { Component } from 'react';
import { Container,Button } from 'reactstrap';
import { getObservatorybyId, getOrganization } from '../network';
import { StyledStatementItem } from 'components/AddPaper/Contributions/styled';
import ShortRecord from '../components/ShortRecord/ShortRecord';
import StatementBrowser from '../components/StatementBrowser/Statements';
import EditableHeader from '../components/EditableHeader';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
import PropTypes from 'prop-types';
import SameAsStatements from './SameAsStatements';
import ROUTES from '../constants/routes';
import { Redirect } from 'react-router-dom';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';

class Observatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            redirect: false,
            isLoading: false,
            editMode: false,
            classes: [],
            image: '',
            resourceId:'',
            totalObservatories:'',
            url:'',
            users:[]
        };
    }

    componentDidMount() {
        this.findObs();
        //this.getTotalObservatories(this.props.match.params.id);
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            //this.findObs();
        }
    };

    findObs = () => {
        //alert(this.props.match.params.id);
        this.setState({ isLoading: true });
        getObservatorybyId(this.props.match.params.id)
            .then(responseJson => {
                //console.log(responseJson.users[0].displayName);
                const allUsers = [...this.state.users, responseJson.users];
                console.log(allUsers[0]);
                this.setState({
                    users: allUsers[0]
                 });
                 console.log(this.state.users);
                //this.state.users: [...this.state.users, ...responseJson.users],
                document.title = `${responseJson.name} - Org - ORKG`;
                this.setState({ label: responseJson.name, isLoading: false});
                const orgInfo = getOrganization(responseJson.organizationId);
                console.log(orgInfo);
                //this.setState({ image: responseJson.organizationLogo, isLoading: false});
                this.setState({ resourceId: this.props.match.params.id});
                //this.getTotalObservatories(this.props.match.params.id);
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false});
            });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    handleHeaderChange = event => {
        this.setState({ label: event.value });
    };

    handleAdd = event => {
        if(event.target.value=="listObservatories")
            this.setState({url:ROUTES.OBSERVATORIES});
        else if(event.target.value="addObservatory")
            this.setState({url:ROUTES.ADD_OBSERVATORY});
        
        this.navigateToResource(this.state.resourceId);
            //await this.createNewResource(false);
         //else {
            //console.log('this is a DOI');
            //this.doi = this.state.value;
            //await this.createResourceUsingDoi();
        //}
    };

    navigateToResource = resourceId => {
        //alert(resourceId);
        this.setState({ resourceId: resourceId }, () => {
            this.setState({ redirect: true });
        });
        //this.setState({ redirect: true });
        //this.setState({redirect: ROUTES.ADD_ORGANIZATION})
        //return <Redirect to={ROUTES.ADD_ORGANIZATION}  />
    };


    render() {
        const id = this.props.match.params.id;

        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                resourceId: ''
            });

            return <Redirect to={reverse(this.state.url, { id: this.state.resourceId })} />;
        }

        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        {this.state.editMode && (
                            <EditModeHeader className="box">
                                <Title>
                                    Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                                </Title>
                                <Button
                                    className="float-left"
                                    style={{ marginLeft: 1 }}
                                    color="light"
                                    size="sm"
                                    onClick={() => this.toggle('editMode')}
                                >
                                    Stop editing
                                </Button>
                            </EditModeHeader>
                        )}
                        <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className={'mb-2'}>
                                {!this.state.editMode ? (
                                    <div className="pb-2 mb-3">
                                        <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            {/* <Button className="float-right" color="darkblue" size="sm" onClick={() => this.toggle('editMode')}> */}
                                                {/* <Icon icon={faPen} /> Edit */}
                                            {/* </Button> */}

                                            {this.state.label}
                                            <br />
                                            <br />
                                            {this.state.users.length > 0 && (                                                
                                            <div>
                                                {this.state.users.map(user => {
                                                    return (
                                                       <h5> <ShortRecord key={user.id} header={user.displayName}>
                                                        </ShortRecord> </h5>
                                                    );
                                                })}
                                            </div>
                                        )}



                                                </h3>
                                        {this.state.classes.length > 0 && (
                                            <span style={{ fontSize: '90%' }}>
                                                Classes:{' '}
                                                {this.state.classes.map((className, index) => {
                                                    const separator = index < this.state.classes.length - 1 ? ', ' : '';

                                                    return (
                                                        <i key={index}>
                                                            {className}
                                                            {separator}
                                                        </i>
                                                    );
                                                })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
                                )}
                            </div>
                            <div className={'clearfix'}>
 
                            
                                        
                                <SameAsStatements />
                            </div>
                        </div>
                    </Container>
                )}
            </>
        );
    }
}

Observatory.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default Observatory;
