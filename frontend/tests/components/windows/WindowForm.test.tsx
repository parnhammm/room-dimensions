import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WindowForm } from '../../../src/components/windows/WindowForm';

jest.mock('../../../src/hooks/useSettings', () => ({ useSettings: () => ({ unit: 'm' }) }));

describe('WindowForm', () => {
  it('rejects zero width', async () => {
    render(<WindowForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'W' } });
    fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Height/i), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/positive/i));
  });
  it('submits valid values', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<WindowForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'Bay' } });
    fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: '1.2' } });
    fireEvent.change(screen.getByLabelText(/Height/i), { target: { value: '1.0' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ label: 'Bay', width: 1.2, height: 1.0 }));
  });
});
