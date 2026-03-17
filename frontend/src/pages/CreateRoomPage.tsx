import { useNavigate } from 'react-router-dom';
import { RoomForm } from '../components/rooms/RoomForm';
import { roomsService } from '../services/roomsService';
import { useState } from 'react';

export function CreateRoomPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { label: string; floor: string }) => {
    setError(null);
    try {
      await roomsService.createRoom(values);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      throw err;
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Room</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <RoomForm onSubmit={handleSubmit} submitLabel="Create Room" error={error} />
      </div>
    </div>
  );
}
