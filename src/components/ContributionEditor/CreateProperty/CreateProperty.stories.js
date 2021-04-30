import CreatePropertyComponent from './CreateProperty';
//import { rest } from 'msw';

export default {
    title: 'Contribution Editor/Create Property',
    component: CreatePropertyComponent
};

const Template = args => <CreatePropertyComponent {...args} />;

export const CreateProperty = Template.bind({});
CreateProperty.args = {};
