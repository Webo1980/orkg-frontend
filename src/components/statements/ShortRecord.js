/* eslint-disable */
import React, {Component} from 'react';

export default class ShortRecord extends Component {

    render() {
        return (<div className="shortRecord">
            <div className="shortRecord-header"><a href={this.props.href}>{this.props.header}</a></div>
            <div className="shortRecord-content">{this.props.children}</div>
                </div>)
    }

}