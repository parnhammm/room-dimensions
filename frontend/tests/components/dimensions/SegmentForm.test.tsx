import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SegmentForm } from '../../../src/components/dimensions/SegmentForm';

vi.mock('../../../src/hooks/useSettings', () => ({
  useSettings: () => ({ unit: 'm', updateUnit: vi.fn(), loading: false, error: null }),
}));

describe('SegmentForm', () => {
  it('rejects zero measurement', async () => {
    render(<SegmentForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/Measurement/i), { target: { value: '0' } });
    fireEvent.submit(screen.getByRole('form', { name: /Segment form/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/positive/i));
  });

  it('rejects negative measurement', async () => {
    render(<SegmentForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/Measurement/i), { target: { value: '-1' } });
    fireEvent.submit(screen.getByRole('form', { name: /Segment form/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/positive/i));
  });

  it('submits valid values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SegmentForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'North' } });
    fireEvent.change(screen.getByLabelText(/Measurement/i), { target: { value: '4.5' } });
    fireEvent.submit(screen.getByRole('form', { name: /Segment form/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ label: 'North', measurement: 4.5 }));
  });
});
