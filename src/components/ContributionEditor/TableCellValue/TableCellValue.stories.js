import TableCellValueComponent from './TableCellValue';

export default {
    title: 'Contribution Editor/Table Cell Value',
    component: TableCellValueComponent,
    argTypes: {
        setDisableCreate: { action: 'setDisableCreate' }
    },
    decorators: [
        Story => (
            <div style={{ width: 300, position: 'relative', border: '2px solid', height: 200 }}>
                <Story />
            </div>
        )
    ]
};

const Template = args => <TableCellValueComponent {...args} />;

export const TableCellValue = Template.bind({});
TableCellValue.args = {
    value: {
        label: 'Example value',
        _class: 'resource',
        id: 'R0',
        statementId: 'S0'
    },
    propertyId: 'P0',
    index: 0,
    setDisableCreate: () => {}
};
