import { render, screen, fireEvent } from '@testing-library/react';
import { UnsavedChangesPrompt } from '../../../src/components/shared/UnsavedChangesPrompt';

describe('UnsavedChangesPrompt', () => {
  it('renders the dialog with heading', () => {
    render(<UnsavedChangesPrompt onSave={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /unsaved changes/i })).toBeInTheDocument();
  });

  it('calls onSave when Save button clicked', () => {
    const onSave = vi.fn();
    render(<UnsavedChangesPrompt onSave={onSave} onDiscard={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onDiscard when Discard button clicked', () => {
    const onDiscard = vi.fn();
    render(<UnsavedChangesPrompt onSave={vi.fn()} onDiscard={onDiscard} />);
    fireEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});
