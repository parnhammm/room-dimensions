import { apiClient } from './apiClient';
import { API_PATHS } from '../constants/api';
import { WallSummaryResponse, WallDetailResponse } from '../types';

export const wallsService = {
  getWalls: (roomId: number) => apiClient.get<WallSummaryResponse[]>(API_PATHS.WALLS(roomId)),
  getWall: (roomId: number, wallId: number) => apiClient.get<WallDetailResponse>(API_PATHS.WALL_BY_ID(roomId, wallId)),
  addWall: (roomId: number, dto: { label: string; width: number; height: number }) =>
    apiClient.post<WallSummaryResponse>(API_PATHS.WALLS(roomId), dto),
  updateWall: (roomId: number, wallId: number, dto: { label?: string; width?: number; height?: number }) =>
    apiClient.patch<WallSummaryResponse>(API_PATHS.WALL_BY_ID(roomId, wallId), dto),
  deleteWall: (roomId: number, wallId: number) => apiClient.delete(API_PATHS.WALL_BY_ID(roomId, wallId)),
};
