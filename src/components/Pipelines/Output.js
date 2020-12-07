import StepContainer from 'components/StepContainer';
import PropTypes from 'prop-types';
import React from 'react';
import { CSVLink } from 'react-csv';
import { Alert, Table, Badge } from 'reactstrap';
import { isString } from 'lodash';

const Output = props => {
    const { latestStep, triples } = props;
    const isActive = latestStep > 2;

    const csvData = triples.map(({ subject, predicate, object }) => ({
        subject: subject.label,
        predicate: predicate.label,
        object: object.label
    }));

    const showLabel = ({ uri, label }) => {
        if (uri) {
            const id = isString(uri) ? uri.substr(uri.lastIndexOf('/') + 1) : null;
            return (
                <u>
                    <a href={uri} target="_blank" rel="noopener noreferrer">
                        {label}
                        {id && (
                            <Badge color="lightblue" className="ml-2">
                                {id}
                            </Badge>
                        )}
                    </a>
                </u>
            );
        } else {
            return label;
        }
    };

    return (
        <StepContainer step="3" title="Output" topLine bottomLine={isActive} active={isActive}>
            <div className="d-flex mb-3 justify-content-between">
                <h2 className="h5 m-0">Extracted triples</h2>
                {triples.length > 0 && (
                    <CSVLink data={csvData} filename="triples.csv" className="btn btn-primary btn-sm" target="_blank">
                        Download CSV
                    </CSVLink>
                )}
            </div>
            {triples.length ? (
                <Table bordered size="sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Subject</th>
                            <th>Predicate</th>
                            <th>Object</th>
                            {/*<th width="180" align="center" />*/}
                        </tr>
                    </thead>
                    <tbody>
                        {triples.map((triple, index) => (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{showLabel(triple.subject)}</td>
                                <td>{showLabel(triple.predicate)}</td>
                                <td>{showLabel(triple.object)}</td>
                                {/*<td>
                                    <Button size="sm" color="darkblue">
                                        Create statement
                                    </Button>
                                </td>*/}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <Alert color="danger">No triples are extracted. Provide a different input or reconfigure the pipeline</Alert>
            )}
        </StepContainer>
    );
};

Output.propTypes = {
    triples: PropTypes.array.isRequired,
    latestStep: PropTypes.number.isRequired
};

export default Output;
