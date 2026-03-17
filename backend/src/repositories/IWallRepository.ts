import { Wall } from '../entities/Wall';

export interface IWallRepository {
  findByRoom(roomId: number): Promise<Wall[]>;
  findById(id: number): Promise<Wall | null>;
  findByIdWithWindows(id: number): Promise<Wall | null>;
  save(wall: Partial<Wall>): Promise<Wall>;
  delete(id: number): Promise<void>;
}
