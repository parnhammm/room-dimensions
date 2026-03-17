import { IWallRepository } from '../repositories/IWallRepository';
import { IRoomRepository } from '../repositories/IRoomRepository';
import { CreateWallDto } from '../dto/wall/CreateWallDto';
import { UpdateWallDto } from '../dto/wall/UpdateWallDto';
import { WallSummaryResponseDto } from '../dto/wall/WallSummaryResponseDto';
import { WallDetailResponseDto } from '../dto/wall/WallDetailResponseDto';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';
import { Wall } from '../entities/Wall';

function toSummary(w: Wall): WallSummaryResponseDto {
  return { id: w.id, label: w.label, width: Number(w.width), height: Number(w.height), createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString() };
}

function toDetail(w: Wall): WallDetailResponseDto {
  return {
    ...toSummary(w),
    windows: (w.windows ?? []).map((win) => ({
      id: win.id, label: win.label, width: Number(win.width), height: Number(win.height),
      createdAt: win.createdAt.toISOString(), updatedAt: win.updatedAt.toISOString(),
    })),
  };
}

export class WallService {
  constructor(private readonly wallRepo: IWallRepository, private readonly roomRepo: IRoomRepository) {}

  async getWalls(roomId: number): Promise<WallSummaryResponseDto[]> {
    return (await this.wallRepo.findByRoom(roomId)).map(toSummary);
  }

  async getWall(roomId: number, wallId: number): Promise<WallDetailResponseDto> {
    const wall = await this.wallRepo.findByIdWithWindows(wallId);
    if (!wall || wall.roomId !== roomId) throw new AppError(ErrorCodes.NOT_FOUND, `Wall ${wallId} not found`);
    return toDetail(wall);
  }

  async addWall(roomId: number, dto: CreateWallDto): Promise<WallSummaryResponseDto> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new AppError(ErrorCodes.NOT_FOUND, `Room ${roomId} not found`);
    return toSummary(await this.wallRepo.save({ ...dto, roomId }));
  }

  async updateWall(roomId: number, wallId: number, dto: UpdateWallDto): Promise<WallSummaryResponseDto> {
    const wall = await this.wallRepo.findById(wallId);
    if (!wall || wall.roomId !== roomId) throw new AppError(ErrorCodes.NOT_FOUND, `Wall ${wallId} not found`);
    return toSummary(await this.wallRepo.save({ ...wall, ...dto }));
  }

  async deleteWall(roomId: number, wallId: number): Promise<void> {
    const wall = await this.wallRepo.findById(wallId);
    if (!wall || wall.roomId !== roomId) throw new AppError(ErrorCodes.NOT_FOUND, `Wall ${wallId} not found`);
    await this.wallRepo.delete(wallId);
  }
}
