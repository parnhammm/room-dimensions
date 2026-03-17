import { apiClient } from './apiClient';
import { API_PATHS } from '../constants/api';
import { RoomResponse, RoomDetailResponse, PrintSummaryResponse } from '../types';

export interface CreateRoomInput {
  label: string;
  floor: string;
}

export interface UpdateRoomInput {
  label?: string;
  floor?: string;
}

export const roomsService = {
  getRooms: () => apiClient.get<RoomResponse[]>(API_PATHS.ROOMS),
  getRoom: (id: number) => apiClient.get<RoomDetailResponse>(API_PATHS.ROOM_BY_ID(id)),
  getSummary: () => apiClient.get<PrintSummaryResponse>(API_PATHS.ROOM_SUMMARY),
  createRoom: (dto: CreateRoomInput) => apiClient.post<RoomResponse>(API_PATHS.ROOMS, dto),
  updateRoom: (id: number, dto: UpdateRoomInput) =>
    apiClient.patch<RoomResponse>(API_PATHS.ROOM_BY_ID(id), dto),
  deleteRoom: (id: number) => apiClient.delete(API_PATHS.ROOM_BY_ID(id)),
};
