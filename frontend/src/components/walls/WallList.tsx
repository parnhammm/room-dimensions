import { WallSummaryResponse } from '../../types';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { useSettings } from '../../hooks/useSettings';
import { useNavigate } from 'react-router-dom';

interface WallListProps {
  roomId: number;
  walls: WallSummaryResponse[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => void;
}

export function WallList({ roomId, walls, loading, error, onDelete }: WallListProps) {
  const { unit } = useSettings();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (walls.length === 0) return <EmptyState message="No walls yet." action={{ label: 'Add Wall', onClick: () => navigate(`/rooms/${roomId}/walls/new`) }} />;

  return (
    <ul className="flex flex-col gap-3">
      {walls.map((w) => (
        <li key={w.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
          <div>
            <p className="font-semibold">{w.label}</p>
            <p className="text-sm text-gray-500">{w.width} × {w.height} {unit}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/rooms/${roomId}/walls/${w.id}`}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">View</Link>
            <Link to={`/rooms/${roomId}/walls/${w.id}/edit`}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              aria-label={`Edit ${w.label}`}>Edit</Link>
            <button onClick={() => { if (window.confirm(`Delete "${w.label}"?`)) onDelete(w.id); }}
              className="rounded-md bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
              aria-label={`Delete ${w.label}`}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
