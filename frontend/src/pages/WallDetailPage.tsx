import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { wallsService } from '../services/wallsService';
import { windowsService } from '../services/windowsService';
import { WallDetailResponse, WindowResponse } from '../types';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { WindowList } from '../components/windows/WindowList';
import { useSettings } from '../hooks/useSettings';

export function WallDetailPage() {
  const { roomId, wallId } = useParams<{ roomId: string; wallId: string }>();
  const [wall, setWall] = useState<WallDetailResponse | null>(null);
  const [windows, setWindows] = useState<WindowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { unit } = useSettings();

  useEffect(() => {
    if (!roomId || !wallId) return;
    Promise.all([wallsService.getWall(+roomId, +wallId), windowsService.getWindows(+roomId, +wallId)])
      .then(([w, wins]) => { setWall(w); setWindows(wins); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [roomId, wallId]);

  if (loading) return <LoadingSpinner />;
  if (error || !wall) return <ErrorMessage message={error ?? 'Wall not found'} />;

  return (
    <div>
      <div className="mb-4">
        <Link to={`/rooms/${roomId}`} className="text-sm text-blue-600 hover:underline">← Back to room</Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{wall.label}</h1>
          <p className="text-gray-500">{wall.width} × {wall.height} {unit}</p>
        </div>
        <Link to={`/rooms/${roomId}/walls/${wallId}/edit`}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">Edit Wall</Link>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Windows</h2>
        <WindowList windows={windows} loading={false} error={null}
          onAdd={async (v) => { const w = await windowsService.addWindow(+roomId!, +wallId!, v); setWindows((p) => [...p, w]); }}
          onUpdate={async (id, v) => { const w = await windowsService.updateWindow(+roomId!, +wallId!, id, v); setWindows((p) => p.map((x) => x.id === id ? w : x)); }}
          onDelete={async (id) => { await windowsService.deleteWindow(+roomId!, +wallId!, id); setWindows((p) => p.filter((x) => x.id !== id)); }} />
      </section>
    </div>
  );
}
