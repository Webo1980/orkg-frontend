import { createRef, Component } from 'react';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { crossrefUrl, submitGetRequest } from 'network';
import { createLiteralStatement } from 'services/backend/statements';
import { classesUrl, getClassById } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { PREDICATES } from 'constants/graphSettings';
import { getArrayParamFromQueryString } from 'utils';
import PropTypes from 'prop-types';

export default class AddResource extends Component {
    constructor(props) {
        super(props);

        this.doi = null;
        this.classesAutocompleteRef = createRef();
        this.state = {
            redirect: false,
            value: '',
            loadingDefaultClasses: false,
            classes: [],
            /* Possible values: 'edit', 'loading'. */
            editorState: 'edit',
            resourceId: '',
            classesOptions: []
        };
    }

    componentDidMount = () => {
        // Set document title
        document.title = 'Add resource - ORKG';
        this.getDefaultClass();
    };

    getDefaultClass = async () => {
        const classes = getArrayParamFromQueryString(this.props.location.search, 'classes');
        if (classes && classes.length > 0) {
            this.setState({ loadingDefaultClasses: true });
            const fetchDefaultClasses = classes.map(c => getClassById(c));
            Promise.all(fetchDefaultClasses)
                .then(classesData => {
                    this.setState({ loadingDefaultClasses: false, classes: classesData });
                })
                .catch(() => {
                    this.setState({ loadingDefaultClasses: true });
                });
        }
    };

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        if (this.state.value.trim()) {
            const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/g;
            if (!doiRegex.test(this.state.value)) {
                await this.createNewResource(false);
            } else {
                console.log('this is a DOI');
                this.doi = this.state.value;
                await this.createResourceUsingDoi();
            }
        } else {
            toast.error('Please enter a resource label');
            this.setEditorState('edit');
        }
    };

    createResourceUsingDoi = async () => {
        try {
            const responseJson = await submitGetRequest(crossrefUrl + this.state.value);
            console.log(responseJson);
            this.setState({ value: responseJson.message.title[0] });
            await this.createNewResource(true);
        } catch (error) {
            console.error(error);
            toast.error(`Error finding DOI ${error.message}`);
            this.setEditorState('edit');
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
    };

    handleClassSelect = async (selected, { action }) => {
        if (action === 'create-option') {
            const foundIndex = selected.findIndex(x => x.__isNew__);
            const newClass = await ConfirmClass({
                label: selected[foundIndex].label
            });
            if (newClass) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                selected[foundIndex] = newClass;
                this.setState({ classes: selected });
            } else {
                return null;
            }
        } else {
            this.setState({ classes: selected });
        }
    };

    handleKeyUp = async event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            await this.handleAdd();
        }
    };

    handleLiteralStatementCreationError = error => {
        console.error(error);
        toast.error(`Error creating literal statement ${error.message}`);
    };

    createNewResource = async usingDoi => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createResource(value, this.state.classes ? this.state.classes.map(c => c.id) : []);
                const resourceId = responseJson.id;

                if (usingDoi) {
                    await this.createDoiStatement(resourceId, PREDICATES.HAS_DOI);
                } else {
                    this.navigateToResource(resourceId);
                }
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                toast.error(`Error creating resource ${error.message}`);
            }
        }
    };

    navigateToResource = resourceId => {
        this.setEditorState('edit');
        this.setState({ resourceId: resourceId }, () => {
            this.setState({ redirect: true });
        });
    };

    createDoiStatement = async (resourceId, predicateId) => {
        const responseJson = await createLiteral(this.doi);
        createLiteralStatement(resourceId, predicateId, responseJson.id).then(result => {
            this.navigateToResource(resourceId);
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                resourceId: ''
            });

            return <Redirect to={reverse(ROUTES.RESOURCE, { id: this.state.resourceId })} />;
        }

        return (
            <>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4">Create resources</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <Form className="pl-3 pr-3 pt-2">
                        {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                        <FormGroup>
                            <Label for="ResourceLabel">Resource title or DOI</Label>
                            <Input
                                onChange={this.handleChange}
                                onKeyUp={this.handleKeyUp}
                                type="text"
                                name="value"
                                id="ResourceLabel"
                                disabled={loading}
                                placeholder="Resource title or DOI"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="select-classes">Classes</Label>
                            {!this.state.loadingDefaultClasses && (
                                <AutoComplete
                                    requestUrl={classesUrl}
                                    onChange={(selected, action) => {
                                        // blur the field allows to focus and open the menu again
                                        this.classesAutocompleteRef.current && this.classesAutocompleteRef.current.blur();
                                        this.handleClassSelect(selected, action);
                                    }}
                                    placeholder="Select or type to enter a class"
                                    value={this.state.classes}
                                    autoLoadOption={true}
                                    openMenuOnFocus={true}
                                    allowCreate={true}
                                    isClearable
                                    innerRef={instance => (this.classesAutocompleteRef = instance)}
                                    isMulti
                                    autoFocus={false}
                                    ols={true}
                                    inputId="select-classes"
                                />
                            )}
                            {this.state.loadingDefaultClasses && <div>Loading default classes</div>}
                        </FormGroup>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.handleAdd();
                            }}
                            className="mt-3 mb-2"
                            disabled={loading}
                        >
                            {!loading ? 'Create Resource' : <span>Loading</span>}
                        </Button>
                    </Form>
                </Container>
            </>
        );
    }
}

AddResource.propTypes = {
    location: PropTypes.object.isRequired
};
