export const MEASUREMENT_UNITS = ['m', 'cm', 'ft', 'in'] as const;
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];
