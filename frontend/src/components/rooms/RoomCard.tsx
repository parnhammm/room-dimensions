import { RoomResponse } from '../../types';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  room: RoomResponse;
  onDelete: (id: number) => void;
}

export function RoomCard({ room, onDelete }: RoomCardProps) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${room.label}"? This will remove all associated data.`)) {
      onDelete(room.id);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <h3 className="font-semibold text-gray-900">{room.label}</h3>
        <p className="text-sm text-gray-500">{room.floor}</p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/rooms/${room.id}/edit`}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label={`Edit ${room.label}`}
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={`Delete ${room.label}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
