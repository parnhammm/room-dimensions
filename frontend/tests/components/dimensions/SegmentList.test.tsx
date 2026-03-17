import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SegmentList } from '../../../src/components/dimensions/SegmentList';
import { SegmentResponse } from '../../../src/types';
import React from 'react';

vi.mock('../../../src/hooks/useSettings', () => ({
  useSettings: () => ({ unit: 'm', updateUnit: vi.fn(), loading: false, error: null }),
}));

const mockSegs: SegmentResponse[] = [
  { id: 1, label: 'North', measurement: 4.5, surfaceType: 'floor', createdAt: '' },
];

const defaultProps = {
  loading: false,
  error: null,
  surfaceLabel: 'floor',
  onAdd: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
};

describe('SegmentList', () => {
  it('shows empty state when no segments', () => {
    render(<SegmentList {...defaultProps} segments={[]} />);
    expect(screen.getByText(/No floor segments yet/i)).toBeInTheDocument();
  });

  it('renders segments with label and measurement', () => {
    render(<SegmentList {...defaultProps} segments={mockSegs} />);
    expect(screen.getByText('North')).toBeInTheDocument();
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    render(<SegmentList {...defaultProps} segments={[]} loading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<SegmentList {...defaultProps} segments={[]} error="Failed" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onDelete with confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<SegmentList {...defaultProps} segments={mockSegs} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/Delete North/i));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
    (window.confirm as ReturnType<typeof vi.fn>).mockRestore();
  });
});
