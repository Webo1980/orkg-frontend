import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LinkWidget extends Component {
    constructor(props) {
        super(props);

        this.refPaths = [];
    }

    componentDidMount() {
        this.updateRenderedPaths();
    }

    componentDidUpdate() {
        this.updateRenderedPaths();
    }

    componentWillUnmount() {
        this.clearRenderedPaths();
    }

    updateRenderedPaths() {
        const { link } = this.props;

        link.setRenderedPaths(
            this.refPaths.map(ref => {
                return ref.current;
            })
        );
    }

    clearRenderedPaths() {
        const { link } = this.props;

        link.setRenderedPaths([]);
    }

    generatePathPoints() {
        const { link } = this.props;

        const points = link.getPoints();

        return points.map((point, i) => ({ from: points[i], to: points[i + 1] })).filter(tuple => tuple.to);
    }

    generateLinePath({ from, to }) {
        return `M${from.getX()},${from.getY()} L${to.getX()},${to.getY()}`;
    }

    renderSegment(path, key) {
        const { link, factory, options = {} } = this.props;

        const { selected } = options;

        const ref = React.createRef();
        this.refPaths.push(ref);

        return React.cloneElement(factory.generateLinkSegment(link, selected || link.isSelected(), path), { key, ref });
    }

    render() {
        const { link } = this.props;

        this.refPaths = [];

        return (
            <>
                <g data-default-link-test={link.getOptions().testName}>
                    {this.generatePathPoints().map((tuple, index) => this.renderSegment(this.generateLinePath(tuple), index))}
                </g>
            </>
        );
    }
}

LinkWidget.propTypes = {
    link: PropTypes.object.isRequired,
    factory: PropTypes.object.isRequired,
    options: PropTypes.object,
    diagramEngine: PropTypes.object.isRequired
};

export default LinkWidget;
