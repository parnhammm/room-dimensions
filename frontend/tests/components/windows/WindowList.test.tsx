import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WindowList } from '../../../src/components/windows/WindowList';
import { WindowResponse } from '../../../src/types';

jest.mock('../../../src/hooks/useSettings', () => ({ useSettings: () => ({ unit: 'm' }) }));

const wins: WindowResponse[] = [{ id: 1, label: 'Bay', width: 1.2, height: 1.0, createdAt: '', updatedAt: '' }];
const p = { loading: false, error: null, onAdd: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

describe('WindowList', () => {
  it('shows empty state', () => {
    render(<WindowList {...p} windows={[]} />);
    expect(screen.getByText(/No windows yet/i)).toBeInTheDocument();
  });
  it('renders windows', () => {
    render(<WindowList {...p} windows={wins} />);
    expect(screen.getByText('Bay')).toBeInTheDocument();
  });
  it('calls onDelete with confirmation', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(<WindowList {...p} windows={wins} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/Delete Bay/i));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
    (window.confirm as jest.Mock).mockRestore();
  });
});
