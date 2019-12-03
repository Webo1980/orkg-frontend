import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getResourcesByClass } from '../../network';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import { TagCloud } from 'react-tagcloud';
import { Redirect } from 'react-router-dom';
import sortBy from 'lodash/sortBy';

class ResearchFieldsCloud extends Component {
    state = {
        researchFields: [],
        loadingResearchFields: false,
        selectedResearchField: null,
        error: ''
    };

    componentDidMount() {
        this.loadResearchFields();
    }

    loadResearchFields = () => {
        this.setState({ loadingResearchFields: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_RESEARCH_FIELD,
            page: 1,
            items: 999,
            desc: true
        }).then(researchFields => {
            let filtredResearchFields = [];
            researchFields.forEach(elm => {
                if (elm.shared > 1) {
                    filtredResearchFields.push({
                        value: elm.label,
                        id: elm.id,
                        count: elm.shared,
                        key: `tag-${elm.id}`
                    });
                }
            });
            filtredResearchFields = sortBy(filtredResearchFields, [
                function(o) {
                    return o.count;
                }
            ]);
            this.setState({
                researchFields: filtredResearchFields.slice(0, 20),
                loadingResearchFields: false
            });
        });
    };

    callbacks = {
        getWordTooltip: word =>
            word.value > 1 ? `There is ${word.value - 1} paper in the research field "${word.text}".` : `No paper yet in "${word.text}" field`,
        onWordClick: (word, event) => {
            this.setState({ selectedResearchField: word.id });
        }
    };

    options = {
        colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
        fontFamily: 'impact',
        fontSizes: [13, 30],
        fontStyle: 'normal',
        fontWeight: 'normal'
    };

    render() {
        if (this.state.error) {
            return <div className="text-center mt-5 text-danger">{this.state.error}</div>;
        }
        if (this.state.selectedResearchField) {
            this.setState({
                selectedResearchField: null
            });

            return <Redirect to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.state.selectedResearchField })} />;
        }
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!this.state.loadingResearchFields ? (
                    <TagCloud
                        minSize={12}
                        maxSize={35}
                        tags={this.state.researchFields}
                        onClick={tag => this.setState({ selectedResearchField: tag.id })}
                    />
                ) : (
                    <div className="mt-5 text-center">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </div>
        );
    }
}

export default ResearchFieldsCloud;
