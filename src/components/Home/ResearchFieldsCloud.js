import React, { Component } from 'react';
import { getResourcesByClass } from '../../network';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import ReactWordcloud from 'react-wordcloud';
import { Redirect } from 'react-router-dom';
import 'd3-transition';
import sortBy from 'lodash/sortBy';

class ResearchFieldsCloud extends Component {
    state = {
        researchFields: [],
        breadcrumb: [],
        papers: null,
        selectedResearchField: null,
        error: ''
    };

    componentDidMount() {
        this.loadResearchFields();
    }

    loadResearchFields = () => {
        this.setState({ loadingPapers: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_RESEARCH_FIELD,
            page: 1,
            items: 999,
            desc: true
        }).then(researchFields => {
            let filtredResearchFields = [];
            researchFields.forEach(elm => {
                filtredResearchFields.push({
                    text: elm.label,
                    id: elm.id,
                    value: elm.shared
                });
            });
            filtredResearchFields = sortBy(filtredResearchFields, [
                function(o) {
                    return o.value;
                }
            ]);
            this.setState({
                researchFields: filtredResearchFields.slice(0, 20),
                loadingPapers: false
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
                <ReactWordcloud options={this.options} callbacks={this.callbacks} words={this.state.researchFields} />
            </div>
        );
    }
}

export default ResearchFieldsCloud;
