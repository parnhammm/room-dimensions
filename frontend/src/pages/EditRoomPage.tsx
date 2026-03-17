import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RoomForm } from '../components/rooms/RoomForm';
import { roomsService } from '../services/roomsService';
import { RoomResponse } from '../types';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';

export function EditRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    roomsService
      .getRoom(parseInt(roomId, 10))
      .then((r) => setRoom(r))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) return <LoadingSpinner />;
  if (error || !room) return <ErrorMessage message={error ?? 'Room not found'} />;

  const handleSubmit = async (values: { label: string; floor: string }) => {
    await roomsService.updateRoom(parseInt(roomId!, 10), values);
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Room</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <RoomForm
          initialValues={{ label: room.label, floor: room.floor }}
          onSubmit={handleSubmit}
          submitLabel="Update Room"
        />
      </div>
    </div>
  );
}
