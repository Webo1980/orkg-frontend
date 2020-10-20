import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Boolean from './Boolean/Boolean';
import Link from './Link/Link';
import Latex from './Latex/Latex';
import Video from './Video/Video';
import Doi from './Doi/Doi';
import ImageAsFigure from './Images/ImagesAsFiguers';

class ValuePlugins extends Component {
    render() {
        // Because videos are links, Video needs to be inside Link
        return (
            <Boolean>
                <Latex type={this.props.type}>
                    <Doi type={this.props.type}>
                        <Link type={this.props.type}>
                            <Video type={this.props.type} options={this.props.options}>
                                <ImageAsFigure type={this.props.type} options={this.props.options}>
                                    {this.props.children}
                                </ImageAsFigure>
                            </Video>
                        </Link>
                    </Doi>
                </Latex>
            </Boolean>
        );
    }
}

ValuePlugins.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
    options: PropTypes.object.isRequired
};

ValuePlugins.defaultProps = {
    options: {}
};

export default ValuePlugins;
