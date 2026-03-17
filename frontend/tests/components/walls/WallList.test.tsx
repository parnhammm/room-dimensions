import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WallList } from '../../../src/components/walls/WallList';
import { WallSummaryResponse } from '../../../src/types';

vi.mock('../../../src/hooks/useSettings', () => ({ useSettings: () => ({ unit: 'm' }) }));

const walls: WallSummaryResponse[] = [
  { id: 1, label: 'North', width: 5, height: 2.4, createdAt: '', updatedAt: '' },
];

function wrap(ui: React.ReactElement) { return render(<MemoryRouter>{ui}</MemoryRouter>); }

describe('WallList', () => {
  it('shows empty state', () => {
    wrap(<WallList roomId={1} walls={[]} loading={false} error={null} onDelete={vi.fn()} />);
    expect(screen.getByText(/No walls yet/i)).toBeInTheDocument();
  });
  it('renders walls with unit', () => {
    wrap(<WallList roomId={1} walls={walls} loading={false} error={null} onDelete={vi.fn()} />);
    expect(screen.getByText('North')).toBeInTheDocument();
    expect(screen.getByText(/5.*2\.4.*m/)).toBeInTheDocument();
  });
  it('calls onDelete with confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn();
    wrap(<WallList roomId={1} walls={walls} loading={false} error={null} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/Delete North/i));
    expect(onDelete).toHaveBeenCalledWith(1);
    (window.confirm as ReturnType<typeof vi.fn>).mockRestore();
  });
});
