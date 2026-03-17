import { Room } from '../entities/Room';

export interface IRoomRepository {
  findAll(): Promise<Room[]>;
  findById(id: number): Promise<Room | null>;
  findByIdWithRelations(id: number): Promise<Room | null>;
  findAllWithRelations(): Promise<Room[]>;
  save(room: Partial<Room>): Promise<Room>;
  delete(id: number): Promise<void>;
}
