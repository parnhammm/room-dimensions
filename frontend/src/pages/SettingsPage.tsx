import { useState } from 'react';
import { UnitSelector } from '../components/settings/UnitSelector';
import { useSettings } from '../hooks/useSettings';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { Unit } from '../types';

export function SettingsPage() {
  const { unit, updateUnit, loading, error } = useSettings();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const handleChange = async (newUnit: Unit) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateUnit(newUnit);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <UnitSelector value={unit} onChange={handleChange} disabled={saving} />
        {saving && <LoadingSpinner label="Saving..." />}
        {saveError && <ErrorMessage message={saveError} />}
      </div>
    </div>
  );
}
