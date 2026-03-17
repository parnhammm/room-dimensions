import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { SurfaceDimensionPanel } from '../../../src/components/dimensions/SurfaceDimensionPanel';
import { SurfaceDimensionResponse } from '../../../src/types';

vi.mock('../../../src/hooks/useSettings', () => ({ useSettings: () => ({ unit: 'm' }) }));
vi.mock('../../../src/hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: () => ({ markDirty: vi.fn(), markClean: vi.fn() }),
}));

const mockApi = vi.hoisted(() => ({
  upsertFloorDimension: vi.fn(),
  deleteFloorDimension: vi.fn(),
  upsertCeilingDimension: vi.fn(),
  deleteCeilingDimension: vi.fn(),
  getFloorDimension: vi.fn(),
  getCeilingDimension: vi.fn(),
}));
vi.mock('../../../src/services/surfaceDimensionApi', () => ({ surfaceDimensionApi: mockApi }));

const dimension: SurfaceDimensionResponse = {
  id: 1,
  surfaceType: 'floor',
  width: 5,
  length: 4.2,
  roomId: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function openForm() {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name: /add floor dimensions/i }));
  });
}

function submitForm(widthVal: string, lengthVal: string) {
  act(() => {
    fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: widthVal } });
    fireEvent.change(screen.getByLabelText(/Length/i), { target: { value: lengthVal } });
    fireEvent.submit(screen.getByRole('form', { name: /floor dimension form/i }));
  });
}

// eslint-disable-next-line max-lines-per-function
describe('SurfaceDimensionPanel — floor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CTA button when no dimension set', () => {
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={null} />);
    expect(screen.getByRole('button', { name: /add floor dimensions/i })).toBeInTheDocument();
  });

  it('shows form when CTA is clicked', () => {
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={null} />);
    openForm();
    expect(screen.getByLabelText(/Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Length/i)).toBeInTheDocument();
  });

  it('calls upsert API on form submit', async () => {
    mockApi.upsertFloorDimension.mockResolvedValue(dimension);
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={null} />);
    openForm();
    submitForm('5', '4.2');
    await waitFor(() => expect(mockApi.upsertFloorDimension).toHaveBeenCalledWith(1, { width: 5, length: 4.2 }));
  });

  it('shows validation error for zero width', async () => {
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={null} />);
    openForm();
    submitForm('0', '4');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/positive/i));
  });

  it('shows validation error for negative length', async () => {
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={null} />);
    openForm();
    submitForm('5', '-1');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/positive/i));
  });

  it('renders display mode with width, length, and unit when dimension is set', () => {
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={dimension} />);
    expect(screen.getByText(/Width/i)).toBeInTheDocument();
    const container = screen.getByText(/Width/i).closest('p')!;
    expect(container.textContent).toMatch(/5/);
    expect(container.textContent).toMatch(/4\.2/);
  });

  it('calls delete API on Remove click and returns to CTA', async () => {
    mockApi.deleteFloorDimension.mockResolvedValue(undefined);
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={dimension} />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /remove floor dimensions/i }));
    });
    await waitFor(() => expect(mockApi.deleteFloorDimension).toHaveBeenCalledWith(1));
    expect(screen.getByRole('button', { name: /add floor dimensions/i })).toBeInTheDocument();
  });

  it('clearing fields and saving does NOT call delete (FR-011)', async () => {
    mockApi.upsertFloorDimension.mockResolvedValue(dimension);
    render(<SurfaceDimensionPanel roomId={1} surfaceType="floor" initialDimension={dimension} />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText(/Width/i), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText(/Length/i), { target: { value: '' } });
      fireEvent.submit(screen.getByRole('form', { name: /floor dimension form/i }));
    });
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(mockApi.deleteFloorDimension).not.toHaveBeenCalled();
  });
});
