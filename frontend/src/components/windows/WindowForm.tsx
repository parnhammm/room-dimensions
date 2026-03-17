import { useState } from 'react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useSettings } from '../../hooks/useSettings';

export interface WindowFormValues { label: string; width: number; height: number; }

interface WindowFormProps {
  initialValues?: WindowFormValues;
  onSubmit: (v: WindowFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// eslint-disable-next-line max-lines-per-function
export function WindowForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save' }: WindowFormProps) {
  const { unit } = useSettings();
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [width, setWidth] = useState(initialValues?.width?.toString() ?? '');
  const [height, setHeight] = useState(initialValues?.height?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { markDirty, markClean } = useUnsavedChanges();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(width), h = parseFloat(height);
    if (!label.trim()) { setError('Label is required'); return; }
    if (!width || isNaN(w) || w <= 0) { setError('Width must be positive'); return; }
    if (!height || isNaN(h) || h <= 0) { setError('Height must be positive'); return; }
    setError(null); setSubmitting(true);
    try { await onSubmit({ label: label.trim(), width: w, height: h }); markClean(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Window form" className="flex flex-col gap-3">
      {error && <ErrorMessage message={error} />}
      <div>
        <label htmlFor="win-label" className="mb-1 block text-sm font-medium text-gray-700">Label</label>
        <input id="win-label" type="text" value={label} onChange={(e) => { setLabel(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="win-width" className="mb-1 block text-sm font-medium text-gray-700">Width ({unit})</label>
        <input id="win-width" type="number" step="0.0001" min="0.0001" value={width}
          onChange={(e) => { setWidth(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="win-height" className="mb-1 block text-sm font-medium text-gray-700">Height ({unit})</label>
        <input id="win-height" type="number" step="0.0001" min="0.0001" value={height}
          onChange={(e) => { setHeight(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && <button type="button" onClick={onCancel}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300">Cancel</button>}
      </div>
    </form>
  );
}
