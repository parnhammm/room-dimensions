import { useState, useEffect } from 'react';
import { roomsService } from '../services/roomsService';
import { PrintSummaryResponse } from '../types';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { PrintSummary } from '../components/print/PrintSummary';

export function PrintPage() {
  const [data, setData] = useState<PrintSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    roomsService.getSummary()
      .then(setData).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Print Summary</h1>
        <button onClick={() => window.print()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Print / Save as PDF
        </button>
      </div>
      {data && <PrintSummary data={data} />}
    </div>
  );
}
