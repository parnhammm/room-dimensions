import { useState } from 'react';
import { WindowResponse } from '../../types';
import { WindowForm } from './WindowForm';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { useSettings } from '../../hooks/useSettings';

interface WindowListProps {
  windows: WindowResponse[];
  loading: boolean;
  error: string | null;
  onAdd: (v: { label: string; width: number; height: number }) => Promise<void>;
  onUpdate: (id: number, v: { label?: string; width?: number; height?: number }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function WindowList({ windows, loading, error, onAdd, onUpdate, onDelete }: WindowListProps) {
  const { unit } = useSettings();
  const [editId, setEditId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex flex-col gap-3">
      {windows.length === 0 && !showAdd && <EmptyState message="No windows yet." />}
      {windows.map((w) => (
        <div key={w.id} className="rounded border bg-white p-3">
          {editId === w.id ? (
            <WindowForm initialValues={{ label: w.label, width: w.width, height: w.height }}
              onSubmit={async (v) => { await onUpdate(w.id, v); setEditId(null); }}
              onCancel={() => setEditId(null)} submitLabel="Update" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{w.label}</span>
                <span className="ml-2 text-gray-500">{w.width} × {w.height} {unit}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditId(w.id)} className="text-sm text-blue-600 hover:underline" aria-label={`Edit ${w.label}`}>Edit</button>
                <button onClick={async () => { if (window.confirm(`Delete "${w.label}"?`)) await onDelete(w.id); }}
                  className="text-sm text-red-600 hover:underline" aria-label={`Delete ${w.label}`}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {showAdd ? (
        <WindowForm onSubmit={async (v) => { await onAdd(v); setShowAdd(false); }} onCancel={() => setShowAdd(false)} submitLabel="Add" />
      ) : (
        <button onClick={() => setShowAdd(true)} className="self-start rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">+ Add Window</button>
      )}
    </div>
  );
}
