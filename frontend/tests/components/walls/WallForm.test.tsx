import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WallForm } from '../../../src/components/walls/WallForm';

jest.mock('../../../src/hooks/useSettings', () => ({ useSettings: () => ({ unit: 'm' }) }));

describe('WallForm', () => {
  it('rejects zero width', async () => {
    render(<WallForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'W' } });
    fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Height/i), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/positive/i));
  });
  it('submits valid values', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<WallForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'South' } });
    fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Height/i), { target: { value: '2.4' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ label: 'South', width: 5, height: 2.4 }));
  });
  it('pre-populates in edit mode', () => {
    render(<WallForm initialValues={{ label: 'North', width: 3, height: 2 }} onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/Label/i)).toHaveValue('North');
  });
});
