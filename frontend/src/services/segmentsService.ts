import { apiClient } from './apiClient';
import { API_PATHS } from '../constants/api';
import { SegmentResponse } from '../types';

export interface CreateSegmentInput {
  label: string;
  measurement: number;
  surfaceType: 'floor' | 'ceiling';
  width?: number;
  length?: number;
}

export interface UpdateSegmentInput {
  label?: string;
  measurement?: number;
  width?: number;
  length?: number;
}

export const segmentsService = {
  getSegments: (roomId: number, surface: 'floor' | 'ceiling') =>
    apiClient.get<SegmentResponse[]>(`${API_PATHS.SEGMENTS(roomId)}?surface=${surface}`),
  addSegment: (roomId: number, dto: CreateSegmentInput) =>
    apiClient.post<SegmentResponse>(API_PATHS.SEGMENTS(roomId), dto),
  updateSegment: (roomId: number, segId: number, dto: UpdateSegmentInput) =>
    apiClient.patch<SegmentResponse>(API_PATHS.SEGMENT_BY_ID(roomId, segId), dto),
  deleteSegment: (roomId: number, segId: number) =>
    apiClient.delete(API_PATHS.SEGMENT_BY_ID(roomId, segId)),
};
