import { DataSource, Repository } from 'typeorm';
import { Window } from '../entities/Window';
import { IWindowRepository } from './IWindowRepository';

export class WindowRepository implements IWindowRepository {
  private readonly repo: Repository<Window>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Window);
  }

  async findByWall(wallId: number): Promise<Window[]> {
    return this.repo.find({ where: { wallId }, order: { createdAt: 'ASC' } });
  }

  async findById(id: number): Promise<Window | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(window: Partial<Window>): Promise<Window> {
    return this.repo.save(window);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
