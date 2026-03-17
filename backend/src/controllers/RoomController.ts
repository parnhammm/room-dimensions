import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/RoomService';

export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  listRooms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rooms = await this.roomService.listRooms();
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  };

  getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.roomService.printSummary();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  };

  getRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const room = await this.roomService.getRoom(parseInt(req.params.roomId, 10));
      res.json(room);
    } catch (err) {
      next(err);
    }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const room = await this.roomService.createRoom(req.body);
      res.status(201).json(room);
    } catch (err) {
      next(err);
    }
  };

  updateRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const room = await this.roomService.updateRoom(parseInt(req.params.roomId, 10), req.body);
      res.json(room);
    } catch (err) {
      next(err);
    }
  };

  deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.roomService.deleteRoom(parseInt(req.params.roomId, 10));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
