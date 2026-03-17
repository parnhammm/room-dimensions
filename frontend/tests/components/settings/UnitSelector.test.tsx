import { render, screen, fireEvent } from '@testing-library/react';
import { UnitSelector } from '../../../src/components/settings/UnitSelector';

describe('UnitSelector', () => {
  it('renders all four unit options', () => {
    render(<UnitSelector value="m" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'Metres (m)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Centimetres (cm)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Feet (ft)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Inches (in)' })).toBeInTheDocument();
  });

  it('checks the radio matching the current value', () => {
    render(<UnitSelector value="ft" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'Feet (ft)' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Metres (m)' })).not.toBeChecked();
  });

  it('calls onChange with the selected unit when a radio is clicked', () => {
    const onChange = vi.fn();
    render(<UnitSelector value="m" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: /centimetres/i }));
    expect(onChange).toHaveBeenCalledWith('cm');
  });

  it('disables all radios when disabled prop is true', () => {
    render(<UnitSelector value="m" onChange={vi.fn()} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toBeDisabled());
  });
});
