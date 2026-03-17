interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
      <p className="text-lg">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
