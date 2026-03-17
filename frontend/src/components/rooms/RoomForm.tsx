import { useState, useEffect } from 'react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { ErrorMessage } from '../shared/ErrorMessage';

export interface RoomFormValues {
  label: string;
  floor: string;
}

interface RoomFormProps {
  initialValues?: RoomFormValues;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  submitLabel?: string;
  error?: string | null;
}

export function RoomForm({ initialValues, onSubmit, submitLabel = 'Save', error }: RoomFormProps) {
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [floor, setFloor] = useState(initialValues?.floor ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { markDirty, markClean } = useUnsavedChanges();

  useEffect(() => {
    if (initialValues) {
      setLabel(initialValues.label);
      setFloor(initialValues.floor);
    }
  }, [initialValues?.label, initialValues?.floor]);

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    markDirty();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setValidationError('Label is required');
      return;
    }
    if (!floor.trim()) {
      setValidationError('Floor is required');
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await onSubmit({ label: label.trim(), floor: floor.trim() });
      markClean();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {(validationError || error) && (
        <ErrorMessage message={validationError ?? error ?? ''} />
      )}
      <div>
        <label htmlFor="room-label" className="mb-1 block text-sm font-medium text-gray-700">
          Room Label
        </label>
        <input
          id="room-label"
          type="text"
          value={label}
          onChange={handleChange(setLabel)}
          placeholder="e.g. Kitchen"
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="room-floor" className="mb-1 block text-sm font-medium text-gray-700">
          Floor
        </label>
        <input
          id="room-floor"
          type="text"
          value={floor}
          onChange={handleChange(setFloor)}
          placeholder="e.g. Ground Floor"
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
