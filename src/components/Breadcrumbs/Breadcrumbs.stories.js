import BreadcrumbsComponent from './Breadcrumbs';

export default {
    title: 'Breadcrumbs',
    component: BreadcrumbsComponent,
    argTypes: {
        onFieldClick: { action: 'onFieldClick' }
    }
};

const Template = args => <BreadcrumbsComponent {...args} />;

export const Breadcrumbs = Template.bind({});
Breadcrumbs.args = {
    researchFieldId: 'R100',
    disableLastField: true,
    backgroundWhite: false
};
