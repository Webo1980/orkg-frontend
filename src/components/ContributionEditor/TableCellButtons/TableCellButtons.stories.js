import TableCellButtons from './TableCellButtons';

export default {
    title: 'Contribution Editor/Table Cell Buttons',
    component: TableCellButtons,
    argTypes: {
        onDelete: { action: 'onDelete' },
        onEdit: { action: 'onEdit' },
        backgroundColor: { control: 'color' }
    },
    decorators: [
        Story => (
            <div style={{ width: 300, position: 'relative', border: '2px solid', height: 200 }}>
                <Story />
            </div>
        )
    ]
};

const Template = args => <TableCellButtons {...args} />;

export const ButtonsEnabled = Template.bind({});
ButtonsEnabled.args = {
    style: { display: 'block' },
    backgroundColor: 'rgba(139, 145, 165, 0.8)'
};

export const ButtonsDisabled = Template.bind({});
ButtonsDisabled.args = {
    ...ButtonsEnabled.args,
    onEdit: null,
    onDelete: null
};
