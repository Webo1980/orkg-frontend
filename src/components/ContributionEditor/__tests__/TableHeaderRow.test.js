import { render, screen, fireEvent } from 'testUtils';
import TableHeaderRow from '../TableHeaderRow';

const setup = () => {
    const property = {
        id: 'P1',
        label: 'property label'
    };

    render(<TableHeaderRow property={property} />);
};

test('should show the property title in the row header', () => {
    setup();
    expect(screen.getByRole('button', { name: /property label/i })).toBeInTheDocument();
});

test('should open statement browser on property click', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /property label/i }));
    expect(screen.getByRole('heading', { name: /view existing property/i })).toBeInTheDocument();
});

test('should show autocomplete on property edit', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
    expect(screen.getByRole('textbox', { name: /enter a property/i })).toBeInTheDocument();
});

test('should hide autocomplete on blur input', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /edit/i, hidden: true }));
    fireEvent.blur(screen.getByRole('textbox', { name: /enter a property/i }));
    expect(screen.getByRole('button', { name: /property label/i })).toBeInTheDocument();
});
