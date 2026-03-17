import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RoomList } from '../components/rooms/RoomList';
import { roomsService } from '../services/roomsService';
import { RoomResponse } from '../types';

export function RoomListPage() {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomsService.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const handleDelete = async (id: number) => {
    try {
      await roomsService.deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <Link
          to="/rooms/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Room
        </Link>
      </div>
      <RoomList rooms={rooms} loading={loading} error={error} onDelete={handleDelete} />
    </div>
  );
}
