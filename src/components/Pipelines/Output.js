import StepContainer from 'components/StepContainer';
import PropTypes from 'prop-types';
import React from 'react';
import { CSVLink } from 'react-csv';
import { Alert, Table } from 'reactstrap';

const Output = props => {
    const { latestStep, triples } = props;

    const csvData = triples.map(({ subject, predicate, object }) => ({
        subject: subject.label,
        predicate: predicate.label,
        object: object.label
    }));

    const showLabel = item => {
        if (item.uri) {
            return (
                <u>
                    <a href={item.uri} target="_blank" rel="noopener noreferrer">
                        {item.label}
                    </a>
                </u>
            );
        } else {
            return item.label;
        }
    };

    return (
        <StepContainer step="3" title="Output" topLine active={latestStep > 2}>
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
