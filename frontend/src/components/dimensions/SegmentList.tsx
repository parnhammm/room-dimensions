import { useState } from 'react';
import { SegmentResponse } from '../../types';
import { SegmentForm } from './SegmentForm';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { useSettings } from '../../hooks/useSettings';

interface SegmentListProps {
  segments: SegmentResponse[];
  loading: boolean;
  error: string | null;
  surfaceLabel: string;
  onAdd: (values: { label: string; measurement: number }) => Promise<void>;
  onUpdate: (id: number, values: { label?: string; measurement?: number }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function SegmentList({ segments, loading, error, surfaceLabel, onAdd, onUpdate, onDelete }: SegmentListProps) {
  const { unit } = useSettings();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex flex-col gap-3">
      {segments.length === 0 && !showAddForm && (
        <EmptyState message={`No ${surfaceLabel} segments yet.`} />
      )}
      {segments.map((seg) => (
        <div key={seg.id} className="rounded border bg-white p-3">
          {editingId === seg.id ? (
            <SegmentForm
              initialValues={{ label: seg.label, measurement: seg.measurement }}
              onSubmit={async (v) => { await onUpdate(seg.id, v); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
              submitLabel="Update"
            />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{seg.label}</span>
                <span className="ml-2 text-gray-500">{seg.measurement} {unit}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(seg.id)}
                  className="text-sm text-blue-600 hover:underline" aria-label={`Edit ${seg.label}`}>Edit</button>
                <button
                  onClick={async () => {
                    if (window.confirm(`Delete "${seg.label}"?`)) await onDelete(seg.id);
                  }}
                  className="text-sm text-red-600 hover:underline" aria-label={`Delete ${seg.label}`}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {showAddForm ? (
        <SegmentForm
          onSubmit={async (v) => { await onAdd(v); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Add"
        />
      ) : (
        <button onClick={() => setShowAddForm(true)}
          className="self-start rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
          + Add Segment
        </button>
      )}
    </div>
  );
}
