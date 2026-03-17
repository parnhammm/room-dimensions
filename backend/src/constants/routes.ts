export const Routes = {
  API_V1: '/api/v1',
  ROOMS: '/rooms',
  ROOM_BY_ID: '/rooms/:roomId',
  ROOM_SUMMARY: '/rooms/summary',
  SEGMENTS: '/rooms/:roomId/segments',
  SEGMENT_BY_ID: '/rooms/:roomId/segments/:segmentId',
  WALLS: '/rooms/:roomId/walls',
  WALL_BY_ID: '/rooms/:roomId/walls/:wallId',
  WINDOWS: '/rooms/:roomId/walls/:wallId/windows',
  WINDOW_BY_ID: '/rooms/:roomId/walls/:wallId/windows/:windowId',
  SETTINGS: '/settings',
} as const;
