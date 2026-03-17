import { render, screen } from '@testing-library/react';
import { PrintSummary } from '../../../src/components/print/PrintSummary';
import { PrintSummaryResponse } from '../../../src/types';

const mockData: PrintSummaryResponse = {
  unit: 'm',
  floors: [{
    floor: 'Ground Floor',
    rooms: [{
      id: 1, label: 'Kitchen',
      floorSegments: [{ id: 1, label: 'N Base', measurement: 4.5, surfaceType: 'floor', createdAt: '' }],
      ceilingSegments: [],
      walls: [{
        id: 1, label: 'South Wall', width: 5, height: 2.4, createdAt: '', updatedAt: '',
        windows: [{ id: 1, label: 'Bay', width: 1.2, height: 1.0, createdAt: '', updatedAt: '' }],
      }],
    }],
  }],
};

describe('PrintSummary', () => {
  it('renders rooms grouped by floor', () => {
    render(<PrintSummary data={mockData} />);
    expect(screen.getByText('Ground Floor')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('renders segments with unit', () => {
    render(<PrintSummary data={mockData} />);
    expect(screen.getByText(/N Base.*4\.5.*m/)).toBeInTheDocument();
  });

  it('renders walls and windows', () => {
    render(<PrintSummary data={mockData} />);
    expect(screen.getByText('South Wall')).toBeInTheDocument();
    expect(screen.getByText(/Bay.*1\.2.*1\.0.*m/)).toBeInTheDocument();
  });

  it('shows empty state when no rooms', () => {
    render(<PrintSummary data={{ unit: 'm', floors: [] }} />);
    expect(screen.getByText(/No rooms to display/i)).toBeInTheDocument();
  });

  it('has no edit buttons in render output', () => {
    render(<PrintSummary data={mockData} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
