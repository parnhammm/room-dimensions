import { DataSource, Repository } from 'typeorm';
import { Wall } from '../entities/Wall';
import { IWallRepository } from './IWallRepository';

export class WallRepository implements IWallRepository {
  private readonly repo: Repository<Wall>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Wall);
  }

  async findByRoom(roomId: number): Promise<Wall[]> {
    return this.repo.find({ where: { roomId }, order: { createdAt: 'ASC' } });
  }

  async findById(id: number): Promise<Wall | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdWithWindows(id: number): Promise<Wall | null> {
    return this.repo.findOne({
      where: { id },
      relations: { windows: true },
      order: { windows: { createdAt: 'ASC' } },
    });
  }

  async save(wall: Partial<Wall>): Promise<Wall> {
    return this.repo.save(wall);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
