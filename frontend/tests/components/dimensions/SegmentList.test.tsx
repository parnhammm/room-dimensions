import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SegmentList } from '../../../src/components/dimensions/SegmentList';
import { SegmentResponse } from '../../../src/types';
import React from 'react';

jest.mock('../../../src/hooks/useSettings', () => ({
  useSettings: () => ({ unit: 'm', updateUnit: jest.fn(), loading: false, error: null }),
}));

const mockSegs: SegmentResponse[] = [
  { id: 1, label: 'North', measurement: 4.5, surfaceType: 'floor', createdAt: '' },
];

const defaultProps = {
  loading: false,
  error: null,
  surfaceLabel: 'floor',
  onAdd: jest.fn().mockResolvedValue(undefined),
  onUpdate: jest.fn().mockResolvedValue(undefined),
  onDelete: jest.fn().mockResolvedValue(undefined),
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
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(<SegmentList {...defaultProps} segments={mockSegs} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/Delete North/i));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
    (window.confirm as jest.Mock).mockRestore();
  });
});
