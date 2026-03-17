import { useState } from 'react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useSettings } from '../../hooks/useSettings';

export interface SegmentFormValues {
  label: string;
  measurement: number;
  width?: number;
  length?: number;
}

interface SegmentFormProps {
  initialValues?: SegmentFormValues;
  onSubmit: (values: SegmentFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// eslint-disable-next-line max-lines-per-function
export function SegmentForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save' }: SegmentFormProps) {
  const { unit } = useSettings();
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [measurement, setMeasurement] = useState(initialValues?.measurement?.toString() ?? '');
  const [width, setWidth] = useState(initialValues?.width?.toString() ?? '');
  const [length, setLength] = useState(initialValues?.length?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { markDirty, markClean } = useUnsavedChanges();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseFloat(measurement);
    if (!label.trim()) { setError('Label is required'); return; }
    if (!measurement || isNaN(m) || m <= 0) { setError('Measurement must be a positive number'); return; }

    const w = width ? parseFloat(width) : undefined;
    const l = length ? parseFloat(length) : undefined;
    if (w !== undefined && (isNaN(w) || w <= 0)) { setError('Width must be a positive number when provided'); return; }
    if (l !== undefined && (isNaN(l) || l <= 0)) { setError('Length must be a positive number when provided'); return; }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ label: label.trim(), measurement: m, width: w, length: l });
      markClean();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Segment form" className="flex flex-col gap-3">
      {error && <ErrorMessage message={error} />}
      <div>
        <label htmlFor="seg-label" className="mb-1 block text-sm font-medium text-gray-700">Label</label>
        <input
          id="seg-label"
          type="text"
          value={label}
          onChange={(e) => { setLabel(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="seg-measurement" className="mb-1 block text-sm font-medium text-gray-700">
          Measurement ({unit})
        </label>
        <input
          id="seg-measurement"
          type="number"
          step="0.0001"
          min="0.0001"
          value={measurement}
          onChange={(e) => { setMeasurement(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="seg-width" className="mb-1 block text-sm font-medium text-gray-700">
            Width ({unit}) <span className="text-gray-400 font-normal">optional</span>
          </label>
          <input
            id="seg-width"
            type="number"
            step="0.0001"
            min="0.0001"
            value={width}
            onChange={(e) => { setWidth(e.target.value); markDirty(); }}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="seg-length" className="mb-1 block text-sm font-medium text-gray-700">
            Length ({unit}) <span className="text-gray-400 font-normal">optional</span>
          </label>
          <input
            id="seg-length"
            type="number"
            step="0.0001"
            min="0.0001"
            value={length}
            onChange={(e) => { setLength(e.target.value); markDirty(); }}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
