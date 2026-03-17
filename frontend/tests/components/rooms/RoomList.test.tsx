import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoomList } from '../../../src/components/rooms/RoomList';
import { RoomResponse } from '../../../src/types';

const mockRooms: RoomResponse[] = [
  { id: 1, label: 'Kitchen', floor: 'Ground Floor', createdAt: '', updatedAt: '' },
  { id: 2, label: 'Bedroom', floor: 'First Floor', createdAt: '', updatedAt: '' },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RoomList', () => {
  it('shows empty state when no rooms', () => {
    renderWithRouter(<RoomList rooms={[]} loading={false} error={null} onDelete={jest.fn()} />);
    expect(screen.getByText(/No rooms yet/i)).toBeInTheDocument();
  });

  it('renders list of rooms', () => {
    renderWithRouter(
      <RoomList rooms={mockRooms} loading={false} error={null} onDelete={jest.fn()} />,
    );
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Bedroom')).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    renderWithRouter(<RoomList rooms={[]} loading={true} error={null} onDelete={jest.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message', () => {
    renderWithRouter(
      <RoomList rooms={[]} loading={false} error="Network error" onDelete={jest.fn()} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
  });

  it('calls onDelete with confirmation', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = jest.fn();
    renderWithRouter(
      <RoomList rooms={mockRooms} loading={false} error={null} onDelete={onDelete} />,
    );
    fireEvent.click(screen.getAllByLabelText(/Delete/i)[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
    (window.confirm as jest.Mock).mockRestore();
  });
});
