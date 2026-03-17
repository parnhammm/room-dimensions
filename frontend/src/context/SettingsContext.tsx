import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Unit } from '../types';
import { apiClient } from '../services/apiClient';
import { API_PATHS } from '../constants/api';

interface SettingsContextValue {
  unit: Unit;
  updateUnit: (newUnit: Unit) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<Unit>('m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ measurementUnit: Unit }>(API_PATHS.SETTINGS)
      .then((data) => setUnit(data.measurementUnit))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateUnit = useCallback(async (newUnit: Unit) => {
    const data = await apiClient.patch<{ measurementUnit: Unit }>(API_PATHS.SETTINGS, {
      measurementUnit: newUnit,
    });
    setUnit(data.measurementUnit);
  }, []);

  return (
    <SettingsContext.Provider value={{ unit, updateUnit, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}
