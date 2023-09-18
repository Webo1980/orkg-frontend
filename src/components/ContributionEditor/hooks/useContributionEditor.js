import ROUTES from 'constants/routes';
import { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import TableCell from 'components/ContributionEditor/TableCell';
import TableHeaderColumn from 'components/ContributionEditor/TableHeaderColumn';
import TableHeaderColumnFirst from 'components/ContributionEditor/TableHeaderColumnFirst';
import TableHeaderRow from 'components/ContributionEditor/TableHeaderRow';
import { sortBy, uniq, without } from 'lodash';
import qs from 'qs';
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import env from '@beam-australia/react-env';

const useContributionEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const getContributionIds = useCallback(() => {
        const { contributions } = qs.parse(location.search, { comma: true, ignoreQueryPrefix: true });
        const contributionIds = contributions && !Array.isArray(contributions) ? [contributions] : contributions;
        return without(uniq(contributionIds), undefined, null, '') ?? [];
    }, [location.search]);

    const [approvalPercentage, setApprovalPercentage] = useState(0);
    const [clickHistory, setClickHistory] = useState([]);
    const queryParams = new URLSearchParams(location.search);
    const folder = queryParams.get('folder');
    const handleCellClick = (contributionId, propertyId, label, approved) => {
        const timestamp = new Date().toLocaleString();

        setClickHistory(prevHistory => [...prevHistory, { contributionId, propertyId, label, time: timestamp, approved }]);

        // Recalculate approvalPercentage
        const newCountApproved = Object.values(clickHistory.reduce((acc, item) => ({ ...acc, [item.label]: item.approved }), {})).filter(
            status => status,
        ).length;
        const newApprovalPercentage = (newCountApproved / countLabels) * 100;
        setApprovalPercentage(newApprovalPercentage);

        const newData = {
            // Create an object containing the data to be sent
            contributionId,
            propertyId,
            label,
            time: timestamp, // Include the time property
            approved,
            folder,
        };
        fetch(`${env('COMPARISON_WIZARD_API')}save-updated-clicks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });
        return false;
    };
    const countApproved = Object.values(clickHistory.reduce((acc, item) => ({ ...acc, [item.label]: item.approved }), {})).filter(
        status => status,
    ).length;
    const countLabels = useSelector(state => Object.keys(state.contributionEditor.statements)).length;
    const { hasPreviousVersion } = qs.parse(location.search, { ignoreQueryPrefix: true });

    const handleAddContributions = ids => {
        const idsQueryString = [...getContributionIds(), ...ids].join(',');
        navigate(
            `${ROUTES.CONTRIBUTION_EDITOR}?contributions=${idsQueryString}${hasPreviousVersion ? `&hasPreviousVersion=${hasPreviousVersion}` : ''}`,
        );
    };

    const handleRemoveContribution = id => {
        const idsQueryString = getContributionIds()
            .filter(_id => _id !== id)
            .join(',');
        navigate(
            `${ROUTES.CONTRIBUTION_EDITOR}?contributions=${idsQueryString}${hasPreviousVersion ? `&hasPreviousVersion=${hasPreviousVersion}` : ''}`,
        );
    };

    // make an object that supports retrieving statements by propertyId and contributionId
    const getStatementsByPropertyIdAndContributionId = statements => {
        const statementsObject = {};
        for (const [statementId, statement] of Object.entries(statements)) {
            if (!(statement.propertyId in statementsObject)) {
                statementsObject[statement.propertyId] = {};
            }
            if (!(statement.contributionId in statementsObject[statement.propertyId])) {
                statementsObject[statement.propertyId][statement.contributionId] = [];
            }
            statementsObject[statement.propertyId][statement.contributionId].push(statementId);
        }
        return statementsObject;
    };

    const Cell = useCallback(
        cell => (
            <TableCell
                values={cell.value}
                contributionId={cell.column.id}
                propertyId={cell.row.original.property.id}
                handleCellClick={handleCellClick}
                clickHistory={clickHistory}
            />
        ),
        [],
    );

    const generateTableMatrix = useCallback(
        ({ contributions, papers, statements, properties, resources, literals }) => {
            const statementsByPropertyIdAndContributionId = getStatementsByPropertyIdAndContributionId(statements);

            let data = [];
            let columns = [];

            data = Object.keys(properties).map(propertyId => ({
                property: properties[propertyId],
                values: Object.keys(contributions).map(
                    contributionId =>
                        sortBy(
                            statementsByPropertyIdAndContributionId?.[propertyId]?.[contributionId]?.map(statementId => ({
                                ...(statements[statementId].type === 'resource'
                                    ? resources[statements[statementId].objectId]
                                    : literals[statements[statementId].objectId]),
                                statementId,
                            })),
                            value => value?.label?.trim().toLowerCase(),
                        ) || [{}],
                ),
            }));

            data = sortBy(data, date => date.property.label.trim().toLowerCase());
            columns = [
                {
                    Header: <TableHeaderColumnFirst />,
                    accessor: 'property',
                    sticky: 'left',
                    minWidth: 250,
                    Cell: cell => <TableHeaderRow property={cell.value} />,
                },
                ...Object.keys(contributions).map((contributionId, i) => {
                    const contribution = contributions[contributionId];
                    return {
                        id: contributionId,
                        Header: () => <TableHeaderColumn contribution={contribution} paper={papers[contribution.paperId]} key={contributionId} />,
                        accessor: d => d.values[i],
                        Cell,
                    };
                }),
            ];

            return { data, columns };
        },
        [Cell],
    );

    return {
        handleAddContributions,
        handleRemoveContribution,
        getContributionIds,
        generateTableMatrix,
        countApproved,
        clickHistory,
    };
};

export default useContributionEditor;
