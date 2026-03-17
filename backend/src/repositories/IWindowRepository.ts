import { Window } from '../entities/Window';

export interface IWindowRepository {
  findByWall(wallId: number): Promise<Window[]>;
  findById(id: number): Promise<Window | null>;
  save(window: Partial<Window>): Promise<Window>;
  delete(id: number): Promise<void>;
}
