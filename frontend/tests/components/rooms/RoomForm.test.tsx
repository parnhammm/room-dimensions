import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoomForm } from '../../../src/components/rooms/RoomForm';

describe('RoomForm', () => {
  it('shows validation error when label is empty', async () => {
    render(<RoomForm onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Label is required');
    });
  });

  it('shows validation error when floor is empty', async () => {
    render(<RoomForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Room Label/i), { target: { value: 'Kitchen' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Floor is required');
    });
  });

  it('calls onSubmit with trimmed values', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<RoomForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Room Label/i), { target: { value: '  Kitchen  ' } });
    fireEvent.change(screen.getByLabelText(/Floor/i), { target: { value: '  Ground Floor  ' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ label: 'Kitchen', floor: 'Ground Floor' });
    });
  });

  it('pre-populates with initialValues', () => {
    render(
      <RoomForm
        initialValues={{ label: 'Bedroom', floor: 'First Floor' }}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByLabelText(/Room Label/i)).toHaveValue('Bedroom');
    expect(screen.getByLabelText(/Floor/i)).toHaveValue('First Floor');
  });
});
