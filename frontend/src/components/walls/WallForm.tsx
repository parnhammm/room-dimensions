import { useState, useEffect } from 'react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useSettings } from '../../hooks/useSettings';

export interface WallFormValues { label: string; width: number; height: number; }

interface WallFormProps {
  initialValues?: WallFormValues;
  onSubmit: (v: WallFormValues) => Promise<void>;
  submitLabel?: string;
  error?: string | null;
}

export function WallForm({ initialValues, onSubmit, submitLabel = 'Save', error }: WallFormProps) {
  const { unit } = useSettings();
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [width, setWidth] = useState(initialValues?.width?.toString() ?? '');
  const [height, setHeight] = useState(initialValues?.height?.toString() ?? '');
  const [valErr, setValErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { markDirty, markClean } = useUnsavedChanges();

  useEffect(() => {
    if (initialValues) { setLabel(initialValues.label); setWidth(initialValues.width.toString()); setHeight(initialValues.height.toString()); }
  }, [initialValues?.label, initialValues?.width, initialValues?.height]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(width), h = parseFloat(height);
    if (!label.trim()) { setValErr('Label is required'); return; }
    if (!width || isNaN(w) || w <= 0) { setValErr('Width must be positive'); return; }
    if (!height || isNaN(h) || h <= 0) { setValErr('Height must be positive'); return; }
    setValErr(null); setSubmitting(true);
    try { await onSubmit({ label: label.trim(), width: w, height: h }); markClean(); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {(valErr || error) && <ErrorMessage message={valErr ?? error ?? ''} />}
      <div>
        <label htmlFor="wall-label" className="mb-1 block text-sm font-medium text-gray-700">Label</label>
        <input id="wall-label" type="text" value={label} onChange={(e) => { setLabel(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="wall-width" className="mb-1 block text-sm font-medium text-gray-700">Width ({unit})</label>
        <input id="wall-width" type="number" step="0.0001" min="0.0001" value={width}
          onChange={(e) => { setWidth(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="wall-height" className="mb-1 block text-sm font-medium text-gray-700">Height ({unit})</label>
        <input id="wall-height" type="number" step="0.0001" min="0.0001" value={height}
          onChange={(e) => { setHeight(e.target.value); markDirty(); }}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
