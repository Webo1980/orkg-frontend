import TableCellComponent from './TableCell';

export default {
    title: 'Contribution Editor/Table Cell',
    component: TableCellComponent
};

const Template = args => <TableCellComponent {...args} />;

export const TableCellSingleValue = Template.bind({});
TableCellSingleValue.args = {
    values: [
        {
            label: 'Resource label',
            _class: 'resource',
            statementId: 'S1'
        }
    ]
};

export const TableCellMultipleValues = Template.bind({});
TableCellMultipleValues.args = {
    values: [
        {
            label: 'Literal label',
            _class: 'literal',
            statementId: 'S1'
        },
        {
            label: 'Resource label',
            _class: 'resource',
            statementId: 'S2'
        }
    ]
};
