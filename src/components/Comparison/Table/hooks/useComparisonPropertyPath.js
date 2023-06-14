/* eslint-disable arrow-body-style */
import { flatten, isEqual, uniqWith } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

const useComparisonPropertyPath = () => {
    const expandedPropertyPaths = useSelector(state => state.comparison.expandedPropertyPaths);
    const contributionStatements = useSelector(state => state.comparison.contributionStatements);

    const renderNestedRows = useCallback(
        ({ statements, subjectIds, labelsPaths = [] }) => {
            let extendedRows = [];
            for (const path of expandedPropertyPaths) {
                const nestedStatements = statements.filter(
                    statement =>
                        subjectIds.includes(statement.subject.id) &&
                        isEqual(statement.path, path) &&
                        labelsPaths.find(pathLabel => {
                            // this check is probably not needed, since this is done already below
                            return pathLabel
                                ? isEqual(
                                      statement.pathLabels.map(l => l?.id),
                                      [...pathLabel.map(l => l.id), statement.subject.id, statement.predicate.id],
                                  )
                                : false;
                        }),
                );

                for (const nestedStatement of nestedStatements) {
                    const rowExists = extendedRows.findIndex(row => {
                        const columnIndex = row.findIndex(cell => cell?.subject?.id === nestedStatement.subject.id);
                        const found = row.find(cell => {
                            if (columnIndex) {
                                return (
                                    row[columnIndex]?.subject?.id !== nestedStatement.subject.id &&
                                    cell?.predicate?.id === nestedStatement.predicate.id
                                );
                            }
                            return cell?.subject?.id !== nestedStatement.subject.id && cell?.predicate?.id === nestedStatement.predicate.id;
                        });
                        return found;
                    });

                    for (const [index, subjectId] of subjectIds.entries()) {
                        if (
                            subjectId === nestedStatement.subject.id &&
                            isEqual(
                                // only add the row if the pathLabels match the column pathLabels.. (prevents matching resources from other columns)
                                nestedStatement.pathLabels.map(l => l?.id),
                                [...labelsPaths[index].map(l => l.id), nestedStatement.subject.id, nestedStatement.predicate.id],
                            )
                        ) {
                            if (rowExists === -1) {
                                extendedRows.push(subjectIds.map(subjectId => (subjectId === nestedStatement.subject.id ? nestedStatement : null)));
                            } else {
                                extendedRows[rowExists] = subjectIds.map(
                                    // eslint-disable-next-line no-loop-func
                                    (subjectId, index) =>
                                        extendedRows[rowExists][index] || (subjectId === nestedStatement.subject.id ? nestedStatement : null),
                                );
                            }
                        }
                    }
                }
            }

            extendedRows = extendedRows.map(row => [row]);
            for (const [index, row] of extendedRows.filter(_row => _row[0].some(cell => !!cell)).entries()) {
                const newRow = renderNestedRows({
                    statements,
                    subjectIds: row[0].map(cell => cell?.object?.id),
                    labelsPaths: row[0].map(cell => cell?.pathLabels),
                });
                extendedRows[index] = [row[0], ...newRow];
            }
            return flatten(extendedRows);
        },
        [expandedPropertyPaths],
    );

    const getData = useCallback(({ subjectId, statements }) => {
        const result = [];
        for (const statement of statements) {
            if (statement.subject.id === subjectId) {
                result.push({
                    statements: getData({ subjectId: statement.object.id, statements }),
                    ...statement,
                });
            }
        }
        return result;
    }, []);

    const flattenArray = useCallback((arr, path = [], pathLabels = []) => {
        let result = [];

        for (const item of arr) {
            const newItem = { ...item };
            newItem.path = [...path, item.predicate.id];
            newItem.pathLabels = [
                ...pathLabels,

                { id: item.subject.id, label: item.subject.label.toLowerCase(), _class: 'resource' },
                { id: item.predicate.id, label: item.predicate.label.toLowerCase(), _class: 'predicate' },
            ];

            if (item.statements && item.statements.length > 0) {
                const nestedItems = flattenArray(item.statements, newItem.path, newItem.pathLabels);
                result = result.concat(nestedItems);
            }
            result.push(newItem);
        }

        return result;
    }, []);

    const getStatementsWithPath = useCallback(
        statements => {
            let contributionStatementsWithPath = statements.map(bundle =>
                flattenArray(getData({ subjectId: bundle.root, statements: bundle.statements })),
            );

            return flatten(contributionStatementsWithPath);
        },
        [flattenArray, getData],
    );

    const getUniqueProperties = useCallback(
        statements => {
            return uniqWith(getStatementsWithPath(statements), (a, b) => JSON.stringify(a.path) === JSON.stringify(b.path)).map(statement => ({
                ...statement.predicate,
                path: statement.path,
            }));
        },
        [getStatementsWithPath],
    );

    const tableData = useMemo(() => {
        // let contributionStatementsWithPath = contributionStatements.map(bundle =>
        //     flattenArray(getData({ subjectId: bundle.root, statements: bundle.statements })),
        // );
        // contributionStatementsWithPath = flatten(contributionStatementsWithPath);
        const contributionStatementsWithPath = getStatementsWithPath(contributionStatements);

        const tableRows = renderNestedRows({
            statements: contributionStatementsWithPath,
            subjectIds: contributionStatements.map(statement => statement.root),
            // labelsPaths: contributionStatementsWithPath.filter(s => s.path.length === 1).map(s => []),
            labelsPaths: contributionStatements.map(() => []),
        });

        return tableRows
            .filter(row => row.find(cell => !!cell?.predicate?.id))
            .map(row => ({
                property: {
                    active: true,
                    contributionAmount: 2,
                    id: row.find(cell => !!cell?.predicate?.id).predicate.id,
                    label: `${row.find(cell => !!cell?.predicate?.id).predicate.label}`,
                    similar: [],
                    path: row.find(cell => !!cell?.predicate?.id).path,
                },
                values: [
                    ...row.map(cell => {
                        return [
                            {
                                classes: [],
                                label: cell?.object?.label ?? '',
                                pathLabels: cell?.pathLabels ?? [],
                                resourceId: cell?.object?.id,
                                type: cell?.object?._class,
                                path: row.find(_cell => !!_cell?.predicate?.id).path,
                                // path: cell?.path ?? [],
                                sId: cell?.id,
                            },
                        ];
                    }),
                ],
            }));
    }, [contributionStatements, getStatementsWithPath, renderNestedRows]);

    return { tableData, getStatementsWithPath, getUniqueProperties };
};

export default useComparisonPropertyPath;
