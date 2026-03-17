import { IWindowRepository } from '../repositories/IWindowRepository';
import { IWallRepository } from '../repositories/IWallRepository';
import { CreateWindowDto } from '../dto/window/CreateWindowDto';
import { UpdateWindowDto } from '../dto/window/UpdateWindowDto';
import { WindowResponseDto } from '../dto/window/WindowResponseDto';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';
import { Window as WinEntity } from '../entities/Window';

function toResponse(w: WinEntity): WindowResponseDto {
  return { id: w.id, label: w.label, width: Number(w.width), height: Number(w.height), createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString() };
}

export class WindowService {
  constructor(private readonly winRepo: IWindowRepository, private readonly wallRepo: IWallRepository) {}

  async getWindows(wallId: number): Promise<WindowResponseDto[]> {
    return (await this.winRepo.findByWall(wallId)).map(toResponse);
  }

  async addWindow(wallId: number, dto: CreateWindowDto): Promise<WindowResponseDto> {
    const wall = await this.wallRepo.findById(wallId);
    if (!wall) throw new AppError(ErrorCodes.NOT_FOUND, `Wall ${wallId} not found`);
    return toResponse(await this.winRepo.save({ ...dto, wallId }));
  }

  async updateWindow(wallId: number, winId: number, dto: UpdateWindowDto): Promise<WindowResponseDto> {
    const win = await this.winRepo.findById(winId);
    if (!win || win.wallId !== wallId) throw new AppError(ErrorCodes.NOT_FOUND, `Window ${winId} not found`);
    return toResponse(await this.winRepo.save({ ...win, ...dto }));
  }

  async deleteWindow(wallId: number, winId: number): Promise<void> {
    const win = await this.winRepo.findById(winId);
    if (!win || win.wallId !== wallId) throw new AppError(ErrorCodes.NOT_FOUND, `Window ${winId} not found`);
    await this.winRepo.delete(winId);
  }
}
