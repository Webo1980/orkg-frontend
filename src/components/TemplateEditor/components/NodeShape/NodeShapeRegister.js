import { Component } from 'components/TemplateEditor/core';

import model from './NodeShapeModel';
import widget from './NodeShapeWidget';

export default new Component({
    type: 'NodeShape',
    name: 'NodeShape',
    configurations: [],
    model,
    widget
});
