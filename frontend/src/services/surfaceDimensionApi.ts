import { apiClient } from './apiClient';
import { API_PATHS } from '../constants/api';
import { SurfaceDimensionResponse, UpsertSurfaceDimensionRequest } from '../types';

export const surfaceDimensionApi = {
  getFloorDimension: (roomId: number) =>
    apiClient.get<SurfaceDimensionResponse>(API_PATHS.FLOOR_DIMENSIONS(roomId)),

  upsertFloorDimension: (roomId: number, data: UpsertSurfaceDimensionRequest) =>
    apiClient.put<SurfaceDimensionResponse>(API_PATHS.FLOOR_DIMENSIONS(roomId), data),

  deleteFloorDimension: (roomId: number) =>
    apiClient.delete(API_PATHS.FLOOR_DIMENSIONS(roomId)),

  getCeilingDimension: (roomId: number) =>
    apiClient.get<SurfaceDimensionResponse>(API_PATHS.CEILING_DIMENSIONS(roomId)),

  upsertCeilingDimension: (roomId: number, data: UpsertSurfaceDimensionRequest) =>
    apiClient.put<SurfaceDimensionResponse>(API_PATHS.CEILING_DIMENSIONS(roomId), data),

  deleteCeilingDimension: (roomId: number) =>
    apiClient.delete(API_PATHS.CEILING_DIMENSIONS(roomId)),
};
