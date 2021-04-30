import Providers from 'Providers';
import { theme } from 'testUtils';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/
        }
    }
};

export const decorators = [
    Story => (
        <Providers theme={theme}>
            <Story />
        </Providers>
    )
];
