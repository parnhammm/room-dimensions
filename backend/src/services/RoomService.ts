import { IRoomRepository } from '../repositories/IRoomRepository';
import { CreateRoomDto } from '../dto/room/CreateRoomDto';
import { UpdateRoomDto } from '../dto/room/UpdateRoomDto';
import { RoomResponseDto } from '../dto/room/RoomResponseDto';
import { RoomDetailResponseDto } from '../dto/room/RoomDetailResponseDto';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';
import { Room } from '../entities/Room';
import { SegmentResponseDto } from '../dto/segment/SegmentResponseDto';
import { WallSummaryResponseDto } from '../dto/wall/WallSummaryResponseDto';
import { PrintSummaryResponseDto } from '../dto/print/PrintSummaryResponseDto';
import { IAppSettingsRepository } from '../repositories/IAppSettingsRepository';

function toRoomResponse(room: Room): RoomResponseDto {
  return {
    id: room.id,
    label: room.label,
    floor: room.floor,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

function toDetailResponse(room: Room): RoomDetailResponseDto {
  const floorSegs: SegmentResponseDto[] = (room.dimensionSegments ?? [])
    .filter((s) => s.surfaceType === 'floor')
    .map((s) => ({
      id: s.id,
      label: s.label,
      measurement: Number(s.measurement),
      surfaceType: s.surfaceType,
      createdAt: s.createdAt.toISOString(),
    }));

  const ceilingSegs: SegmentResponseDto[] = (room.dimensionSegments ?? [])
    .filter((s) => s.surfaceType === 'ceiling')
    .map((s) => ({
      id: s.id,
      label: s.label,
      measurement: Number(s.measurement),
      surfaceType: s.surfaceType,
      createdAt: s.createdAt.toISOString(),
    }));

  const walls: WallSummaryResponseDto[] = (room.walls ?? []).map((w) => ({
    id: w.id,
    label: w.label,
    width: Number(w.width),
    height: Number(w.height),
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));

  return { ...toRoomResponse(room), floorSegments: floorSegs, ceilingSegments: ceilingSegs, walls };
}

export class RoomService {
  constructor(
    private readonly roomRepo: IRoomRepository,
    private readonly settingsRepo?: IAppSettingsRepository,
  ) {}

  async listRooms(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepo.findAll();
    return rooms.map(toRoomResponse);
  }

  async getRoom(id: number): Promise<RoomDetailResponseDto> {
    const room = await this.roomRepo.findByIdWithRelations(id);
    if (!room) throw new AppError(ErrorCodes.NOT_FOUND, `Room with id ${id} not found`);
    return toDetailResponse(room);
  }

  async createRoom(dto: CreateRoomDto): Promise<RoomResponseDto> {
    const room = await this.roomRepo.save({ label: dto.label, floor: dto.floor });
    return toRoomResponse(room);
  }

  async updateRoom(id: number, dto: UpdateRoomDto): Promise<RoomResponseDto> {
    const existing = await this.roomRepo.findById(id);
    if (!existing) throw new AppError(ErrorCodes.NOT_FOUND, `Room with id ${id} not found`);
    const updated = await this.roomRepo.save({ ...existing, ...dto });
    return toRoomResponse(updated);
  }

  async deleteRoom(id: number): Promise<void> {
    const existing = await this.roomRepo.findById(id);
    if (!existing) throw new AppError(ErrorCodes.NOT_FOUND, `Room with id ${id} not found`);
    await this.roomRepo.delete(id);
  }

  async printSummary(): Promise<PrintSummaryResponseDto> {
    const [rooms, settings] = await Promise.all([
      this.roomRepo.findAllWithRelations(),
      this.settingsRepo?.findSingleton(),
    ]);

    const unit = settings?.measurementUnit ?? 'm';

    const floorMap = new Map<string, typeof rooms>();
    for (const room of rooms) {
      const existing = floorMap.get(room.floor) ?? [];
      existing.push(room);
      floorMap.set(room.floor, existing);
    }

    const floors = Array.from(floorMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([floor, floorRooms]) => ({
        floor,
        rooms: floorRooms.map((room) => ({
          id: room.id,
          label: room.label,
          floorSegments: (room.dimensionSegments ?? [])
            .filter((s) => s.surfaceType === 'floor')
            .map((s) => ({
              id: s.id,
              label: s.label,
              measurement: Number(s.measurement),
              surfaceType: s.surfaceType as 'floor',
              createdAt: s.createdAt.toISOString(),
            })),
          ceilingSegments: (room.dimensionSegments ?? [])
            .filter((s) => s.surfaceType === 'ceiling')
            .map((s) => ({
              id: s.id,
              label: s.label,
              measurement: Number(s.measurement),
              surfaceType: s.surfaceType as 'ceiling',
              createdAt: s.createdAt.toISOString(),
            })),
          walls: (room.walls ?? []).map((w) => ({
            id: w.id,
            label: w.label,
            width: Number(w.width),
            height: Number(w.height),
            createdAt: w.createdAt.toISOString(),
            updatedAt: w.updatedAt.toISOString(),
            windows: (w.windows ?? []).map((win) => ({
              id: win.id,
              label: win.label,
              width: Number(win.width),
              height: Number(win.height),
              createdAt: win.createdAt.toISOString(),
              updatedAt: win.updatedAt.toISOString(),
            })),
          })),
        })),
      }));

    return { unit, floors };
  }
}
