import { apiClient } from './apiClient';
import { API_PATHS } from '../constants/api';
import { WindowResponse } from '../types';

export const windowsService = {
  getWindows: (roomId: number, wallId: number) => apiClient.get<WindowResponse[]>(API_PATHS.WINDOWS(roomId, wallId)),
  addWindow: (roomId: number, wallId: number, dto: { label: string; width: number; height: number }) =>
    apiClient.post<WindowResponse>(API_PATHS.WINDOWS(roomId, wallId), dto),
  updateWindow: (roomId: number, wallId: number, winId: number, dto: { label?: string; width?: number; height?: number }) =>
    apiClient.patch<WindowResponse>(API_PATHS.WINDOW_BY_ID(roomId, wallId, winId), dto),
  deleteWindow: (roomId: number, wallId: number, winId: number) =>
    apiClient.delete(API_PATHS.WINDOW_BY_ID(roomId, wallId, winId)),
};
