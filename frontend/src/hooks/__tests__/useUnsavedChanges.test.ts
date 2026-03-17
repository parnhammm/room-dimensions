import { renderHook, act } from '@testing-library/react';
import { useUnsavedChanges } from '../useUnsavedChanges';

describe('useUnsavedChanges', () => {
  it('starts in clean state', () => {
    const { result } = renderHook(() => useUnsavedChanges());
    expect(result.current.isDirty).toBe(false);
  });

  it('markDirty sets isDirty to true', () => {
    const { result } = renderHook(() => useUnsavedChanges());
    act(() => result.current.markDirty());
    expect(result.current.isDirty).toBe(true);
  });

  it('markClean clears isDirty', () => {
    const { result } = renderHook(() => useUnsavedChanges());
    act(() => result.current.markDirty());
    act(() => result.current.markClean());
    expect(result.current.isDirty).toBe(false);
  });

  it('registers beforeunload listener when dirty', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const { result } = renderHook(() => useUnsavedChanges());
    act(() => result.current.markDirty());
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addSpy.mockRestore();
  });

  it('removes beforeunload listener when clean', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { result } = renderHook(() => useUnsavedChanges());
    act(() => result.current.markDirty());
    act(() => result.current.markClean());
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('promptIfDirty calls onConfirm immediately when clean', () => {
    const { result } = renderHook(() => useUnsavedChanges());
    const onConfirm = jest.fn();
    act(() => result.current.promptIfDirty(onConfirm));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('promptIfDirty shows confirm and calls onConfirm when user confirms', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useUnsavedChanges());
    act(() => result.current.markDirty());
    const onConfirm = jest.fn();
    act(() => result.current.promptIfDirty(onConfirm));
    expect(onConfirm).toHaveBeenCalled();
    (window.confirm as jest.Mock).mockRestore();
  });
});
