interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4" role="status" aria-label={label}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
