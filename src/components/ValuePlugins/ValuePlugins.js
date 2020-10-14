import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Boolean from './Boolean/Boolean';
import Link from './Link/Link';
import Latex from './Latex/Latex';
import Video from './Video/Video';
import Doi from './Doi/Doi';
import WikiPediaLogo from './WikiPediaLookup/WikiPediaLookup';

class ValuePlugins extends Component {
    render() {
        console.log(this.props);
        if (this.props.hasWikiDesc) {
            // TODO: we know this is a link, we should be able to render it without Video
            return (
                <>
                    <Link type={this.props.type}>
                        <Video type={this.props.type} options={this.props.options}>
                            {this.props.children}
                        </Video>
                    </Link>
                    {/*// check if this is an object and higherOrder*/}
                    {this.props.wikipediaLink && this.props.type === 'resource' && <WikiPediaLogo>{this.props.wikipediaLink}</WikiPediaLogo>}
                    {this.props.type === 'literal' && <WikiPediaLogo>{this.props.children}</WikiPediaLogo>}
                </>
            );
        } else {
            // TODO: refactor this logic
            return (
                <Boolean>
                    <Latex type={this.props.type}>
                        <Doi type={this.props.type}>
                            <Link type={this.props.type}>
                                <Video type={this.props.type} options={this.props.options}>
                                    {this.props.children}
                                </Video>
                            </Link>
                        </Doi>
                    </Latex>
                </Boolean>
            );
        }
    }
}

ValuePlugins.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
    hasWikiDesc: PropTypes.bool,
    wikipediaLink: PropTypes.string,
    options: PropTypes.object.isRequired
};

ValuePlugins.defaultProps = {
    options: {}
};

export default ValuePlugins;
