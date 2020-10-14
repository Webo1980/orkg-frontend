import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import styled from 'styled-components';
import { renderToString } from 'react-dom/server';
import { faWikipediaW } from '@fortawesome/free-brands-svg-icons';

const WikiLogo = styled.span`
    color: #000000;
    border: 1px solid gray;
    border-radius: 5px;
    padding: 2px;
    margin-left: 5px;
    font-size: 18px;
`;

export default class WikiPediaLogo extends Component {
    constructor(props) {
        super(props);

        this.componentMounted = false;
        this.state = {
            message: 'Loading...'
        };
    }

    componentDidMount() {
        this.componentMounted = true;
        const providedURL = this.props.children;
        const wikipediaTitle = providedURL.substr(providedURL.indexOf('/wiki/')).replace('/wiki/', '');
        const urlToFetch = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle}?origin=*`;
        this.executeLookup(urlToFetch);
    }

    componentWillUnmount() {
        this.componentMounted = false;
    }

    executeLookup = lookupURL => {
        const that = this;
        fetch(lookupURL)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.extract) {
                    if (that.componentMounted) {
                        that.setState({
                            message: data.extract
                        });
                    }
                } else {
                    if (that.componentMounted) {
                        that.setState({ message: 'Failed loading summary from Wikipedia' });
                    }
                }
            })
            .catch(error => {
                if (that.componentMounted) {
                    this.setState({ message: 'Failed loading summary from Wikipedia' });
                }
            });
    };

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        return (
            <a href={labelToText.indexOf('://') === -1 ? 'http://' + labelToText : labelToText} target="_blank" rel="noopener noreferrer">
                <Tippy content={this.state.message}>
                    {/*// make it a link */}
                    <WikiLogo>
                        <Icon icon={faWikipediaW} />
                    </WikiLogo>
                </Tippy>
            </a>
        );
    }
}

WikiPediaLogo.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};
