interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
    >
      {message}
    </div>
  );
}
