import React, { Component } from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import { Link } from 'react-router-dom';
import { submitGetRequest, url } from '../network';
import { Container } from 'reactstrap';

export default class Resources extends Component {

    constructor(props) {
        super(props);

        this.state = {
            allResources: null,
            results: null,
            error: null,
        };

    }

    async componentDidMount() {
        await this.findAllResources();
    }

    findAllResources = async () => {
        try {
            const responseJson = await submitGetRequest(url + 'resources/');

            this.setState({
                allResources: responseJson,
                error: null,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                allResources: null,
                error: err.message,
            });
        }
    };

    render() {
        const resultsPresent = this.state.error || (this.state.allResources);

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            const resources = this.state.allResources.map(
                resource => (<ShortRecord key={resource.id} header={resource.label}
                    href={`${process.env.PUBLIC_URL}/resource/${encodeURIComponent(resource.id)}`}
                             />)
            );

            return (<Container className="box pt-4 pb-4 pl-5 pr-5 mt-5">
                <div className="addResource toolbar addToolbar-container">
                    <span className="toolbar-button toolbar-button-add">
                        <Link to={`${process.env.PUBLIC_URL}/addResource`}>
                            <span className="fa fa-plus" />add new resource
                        </Link>
                    </span>
                </div>
                {resources}
                    </Container>)
        } else {
            return null;
        }
    }

}
