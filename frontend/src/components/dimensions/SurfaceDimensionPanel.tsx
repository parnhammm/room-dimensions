import { useState } from 'react';
import { SurfaceDimensionResponse, SurfaceType } from '../../types';
import { surfaceDimensionApi } from '../../services/surfaceDimensionApi';
import { useSettings } from '../../hooks/useSettings';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { ErrorMessage } from '../shared/ErrorMessage';

interface Props {
  roomId: number;
  surfaceType: SurfaceType;
  initialDimension: SurfaceDimensionResponse | null;
}

const LABELS: Record<SurfaceType, string> = {
  floor: 'Floor',
  ceiling: 'Ceiling',
};

// eslint-disable-next-line max-lines-per-function
export function SurfaceDimensionPanel({ roomId, surfaceType, initialDimension }: Props) {
  const { unit } = useSettings();
  const { markDirty, markClean } = useUnsavedChanges();
  const [dimension, setDimension] = useState<SurfaceDimensionResponse | null>(initialDimension);
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const label = LABELS[surfaceType];

  const upsert = surfaceType === 'floor'
    ? surfaceDimensionApi.upsertFloorDimension
    : surfaceDimensionApi.upsertCeilingDimension;

  const deleteFn = surfaceType === 'floor'
    ? surfaceDimensionApi.deleteFloorDimension
    : surfaceDimensionApi.deleteCeilingDimension;

  const handleAddClick = () => {
    setWidth('');
    setLength('');
    setError(null);
    setIsEditing(true);
    markDirty();
  };

  const handleEditClick = () => {
    setWidth(dimension!.width.toString());
    setLength(dimension!.length.toString());
    setError(null);
    setIsEditing(true);
    markDirty();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    markClean();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(width);
    const l = parseFloat(length);
    if (!width || isNaN(w) || w <= 0) {
      setError('Width must be a positive number');
      return;
    }
    if (!length || isNaN(l) || l <= 0) {
      setError('Length must be a positive number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await upsert(roomId, { width: w, length: l });
      setDimension(result);
      setIsEditing(false);
      markClean();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteFn(roomId);
      setDimension(null);
      markClean();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-3 text-base font-semibold text-gray-800">{label} Dimensions</h3>

      {error && <ErrorMessage message={error} />}

      {!dimension && !isEditing && (
        <button
          type="button"
          onClick={handleAddClick}
          aria-label={`Add ${label.toLowerCase()} dimensions`}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Add {label.toLowerCase()} dimensions
        </button>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} aria-label={`${label} dimension form`} className="flex flex-col gap-3">
          <div>
            <label htmlFor={`${surfaceType}-width`} className="mb-1 block text-sm font-medium text-gray-700">
              Width ({unit})
            </label>
            <input
              id={`${surfaceType}-width`}
              type="number"
              step="0.0001"
              min="0.0001"
              value={width}
              aria-label="Width"
              onChange={(e) => { setWidth(e.target.value); markDirty(); }}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor={`${surfaceType}-length`} className="mb-1 block text-sm font-medium text-gray-700">
              Length ({unit})
            </label>
            <input
              id={`${surfaceType}-length`}
              type="number"
              step="0.0001"
              min="0.0001"
              value={length}
              aria-label="Length"
              onChange={(e) => { setLength(e.target.value); markDirty(); }}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {dimension && !isEditing && (
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Width:</span> {dimension.width} {unit} &times;{' '}
            <span className="font-medium">Length:</span> {dimension.length} {unit}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleEditClick}
              disabled={loading}
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              aria-label={`Remove ${label.toLowerCase()} dimensions`}
              className="rounded-md bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              {loading ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
