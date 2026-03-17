import { Unit } from '../../types';

const UNITS: { value: Unit; label: string }[] = [
  { value: 'm', label: 'Metres (m)' },
  { value: 'cm', label: 'Centimetres (cm)' },
  { value: 'ft', label: 'Feet (ft)' },
  { value: 'in', label: 'Inches (in)' },
];

interface UnitSelectorProps {
  value: Unit;
  onChange: (unit: Unit) => void;
  disabled?: boolean;
}

export function UnitSelector({ value, onChange, disabled = false }: UnitSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium text-gray-700">Measurement Unit</legend>
      <div className="flex flex-col gap-2">
        {UNITS.map((unit) => (
          <label key={unit.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="measurementUnit"
              value={unit.value}
              checked={value === unit.value}
              onChange={() => onChange(unit.value)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">{unit.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
