import { RoomResponse } from '../../types';
import { RoomCard } from './RoomCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { useNavigate } from 'react-router-dom';

interface RoomListProps {
  rooms: RoomResponse[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => void;
}

export function RoomList({ rooms, loading, error, onDelete }: RoomListProps) {
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (rooms.length === 0) {
    return (
      <EmptyState
        message="No rooms yet. Add your first room."
        action={{ label: 'Add Room', onClick: () => navigate('/rooms/new') }}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Room list">
      {rooms.map((room) => (
        <li key={room.id}>
          <RoomCard room={room} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
