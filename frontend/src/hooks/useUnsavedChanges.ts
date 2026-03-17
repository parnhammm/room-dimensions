import { useState, useEffect, useCallback } from 'react';

export interface UseUnsavedChangesReturn {
  isDirty: boolean;
  markDirty: () => void;
  markClean: () => void;
  promptIfDirty: (onConfirm: () => void) => void;
}

export function useUnsavedChanges(): UseUnsavedChangesReturn {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const markClean = useCallback(() => setIsDirty(false), []);

  const promptIfDirty = useCallback(
    (onConfirm: () => void) => {
      if (!isDirty) {
        onConfirm();
        return;
      }
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setIsDirty(false);
        onConfirm();
      }
    },
    [isDirty],
  );

  return { isDirty, markDirty, markClean, promptIfDirty };
}
