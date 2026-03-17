import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { WallForm } from '../components/walls/WallForm';
import { wallsService } from '../services/wallsService';
import { WallDetailResponse } from '../types';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';

export function EditWallPage() {
  const { roomId, wallId } = useParams<{ roomId: string; wallId: string }>();
  const navigate = useNavigate();
  const [wall, setWall] = useState<WallDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !wallId) return;
    wallsService.getWall(+roomId, +wallId)
      .then(setWall).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [roomId, wallId]);

  if (loading) return <LoadingSpinner />;
  if (error || !wall) return <ErrorMessage message={error ?? 'Wall not found'} />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Wall</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <WallForm
          initialValues={{ label: wall.label, width: wall.width, height: wall.height }}
          onSubmit={async (v) => { await wallsService.updateWall(+roomId!, +wallId!, v); navigate(`/rooms/${roomId}/walls/${wallId}`); }}
          submitLabel="Update Wall"
        />
      </div>
    </div>
  );
}
