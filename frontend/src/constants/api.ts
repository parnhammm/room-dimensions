export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const API_PATHS = {
  ROOMS: '/api/v1/rooms',
  ROOM_BY_ID: (id: number) => `/api/v1/rooms/${id}`,
  ROOM_SUMMARY: '/api/v1/rooms/summary',
  SEGMENTS: (roomId: number) => `/api/v1/rooms/${roomId}/segments`,
  SEGMENT_BY_ID: (roomId: number, segId: number) => `/api/v1/rooms/${roomId}/segments/${segId}`,
  WALLS: (roomId: number) => `/api/v1/rooms/${roomId}/walls`,
  WALL_BY_ID: (roomId: number, wallId: number) => `/api/v1/rooms/${roomId}/walls/${wallId}`,
  WINDOWS: (roomId: number, wallId: number) => `/api/v1/rooms/${roomId}/walls/${wallId}/windows`,
  WINDOW_BY_ID: (roomId: number, wallId: number, winId: number) =>
    `/api/v1/rooms/${roomId}/walls/${wallId}/windows/${winId}`,
  SETTINGS: '/api/v1/settings',
  FLOOR_DIMENSIONS: (roomId: number) => `/api/v1/rooms/${roomId}/floor-dimensions`,
  CEILING_DIMENSIONS: (roomId: number) => `/api/v1/rooms/${roomId}/ceiling-dimensions`,
} as const;
