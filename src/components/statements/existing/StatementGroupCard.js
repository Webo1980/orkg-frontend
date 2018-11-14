import React, {Component, Fragment} from 'react';
import NewStatementObject from '../NewStatementObject';
import AddValueToolbar from './AddValueToolbar';
import Statement from './Statement';

export default class StatementGroupCard extends Component {

    state = {
        newStatementVisible: false,
    };

    constructor() {
        super();

        this.onAddValueClick = this.onAddValueClick.bind(this);
        this.onCancelAddValueClick = this.onCancelAddValueClick.bind(this);
        this.onPublishSuccess = this.onPublishSuccess.bind(this);
    }

    onAddValueClick() {
        this.setState({newStatementVisible: true});
        return false;
    }

    onCancelAddValueClick() {
        this.setState({newStatementVisible: false});
        return false;
    }

    onPublishSuccess(newRecordLabel) {
        this.setState({newStatementVisible: false});
        this.props.onUpdate(newRecordLabel);
    }

    render() {
        const statementGroup = this.props.statementGroup;
        const subjectId = statementGroup[0].subject;
        const predicateId = statementGroup[0].predicate;

        const statements = statementGroup.map(
            (statement, index) => <Statement key={index}
                    getText={this.props.getStatementText(statement)}
                    setText={this.props.setStatementText(statement)}
                    id={statement.object.id}
                    onUpdate={this.reset}
                    type={statement.object.type}
                    subject={statement.subject}
                    predicate={statement.predicate}/>
        );

        return <div className="statementGroupView">
            <div className="statementGroupView-property">
                <div className="statementGroupView-property-label">
                    <a href={this.props.href}>{this.props.label}</a>
                </div>
            </div>
            <div className="statementListView">
                <div className="statementListView-listView" ref="innerListView">
                    <Fragment>
                        {statements}
                        {this.state.newStatementVisible
                                && <NewStatementObject subjectId={subjectId} predicateId={predicateId}
                                        onCancelClick={this.onCancelAddValueClick}
                                        onPublishSuccess={this.onPublishSuccess}/>}
                    </Fragment>
                </div>
                <div className="toolbar-wrapper">
                    <AddValueToolbar onAddValueClick={this.onAddValueClick}/>
                </div>
            </div>
        </div>
    }

}
