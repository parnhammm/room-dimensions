import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SettingsProvider } from '../../context/SettingsContext';
import { useSettings } from '../useSettings';
import { apiClient } from '../../services/apiClient';

vi.mock('../../services/apiClient');

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SettingsProvider, null, children);

describe('useSettings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns initial unit after fetch', async () => {
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ measurementUnit: 'm' });
    const { result } = renderHook(() => useSettings(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.unit).toBe('m');
  });

  it('updateUnit calls PATCH and updates unit', async () => {
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ measurementUnit: 'm' });
    (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ measurementUnit: 'ft' });
    const { result } = renderHook(() => useSettings(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.updateUnit('ft'); });
    expect(result.current.unit).toBe('ft');
  });

  it('sets error state when fetch fails', async () => {
    (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useSettings(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
  });
});
