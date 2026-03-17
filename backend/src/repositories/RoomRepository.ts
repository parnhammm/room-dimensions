import { DataSource, Repository } from 'typeorm';
import { Room } from '../entities/Room';
import { IRoomRepository } from './IRoomRepository';

export class RoomRepository implements IRoomRepository {
  private readonly repo: Repository<Room>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Room);
  }

  async findAll(): Promise<Room[]> {
    return this.repo.find({ order: { floor: 'ASC', createdAt: 'ASC' } });
  }

  async findById(id: number): Promise<Room | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: number): Promise<Room | null> {
    return this.repo.findOne({
      where: { id },
      relations: { dimensionSegments: true, walls: true },
      order: { dimensionSegments: { createdAt: 'ASC' }, walls: { createdAt: 'ASC' } },
    });
  }

  async findAllWithRelations(): Promise<Room[]> {
    return this.repo.find({
      relations: { dimensionSegments: true, walls: { windows: true } },
      order: {
        floor: 'ASC',
        createdAt: 'ASC',
        dimensionSegments: { createdAt: 'ASC' },
        walls: { createdAt: 'ASC', windows: { createdAt: 'ASC' } },
      },
    });
  }

  async save(room: Partial<Room>): Promise<Room> {
    return this.repo.save(room);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
