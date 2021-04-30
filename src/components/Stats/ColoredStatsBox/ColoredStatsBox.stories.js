import ColoredStatsBoxComponent from './ColoredStatsBox';
import { faStream } from '@fortawesome/free-solid-svg-icons';

export default {
    title: 'Colored Stats Box',
    component: ColoredStatsBoxComponent
};

const Template = args => <ColoredStatsBoxComponent {...args} />;

export const ColoredStatsBox = Template.bind({});
ColoredStatsBox.args = {
    color: 'green',
    icon: faStream,
    label: 'Text label',
    number: 99,
    isLoading: false
};
