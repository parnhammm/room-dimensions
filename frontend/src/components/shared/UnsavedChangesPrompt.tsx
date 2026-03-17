interface UnsavedChangesPromptProps {
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesPrompt({ onSave, onDiscard }: UnsavedChangesPromptProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unsaved changes"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Unsaved Changes</h2>
        <p className="mb-6 text-gray-600">You have unsaved changes. What would you like to do?</p>
        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
          <button
            onClick={onDiscard}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
