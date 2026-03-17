import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { WallForm } from '../components/walls/WallForm';
import { wallsService } from '../services/wallsService';

export function AddWallPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (v: { label: string; width: number; height: number }) => {
    setError(null);
    try { await wallsService.addWall(parseInt(roomId!, 10), v); navigate(`/rooms/${roomId}`); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed'); throw err; }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Wall</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <WallForm onSubmit={handleSubmit} submitLabel="Add Wall" error={error} />
      </div>
    </div>
  );
}
