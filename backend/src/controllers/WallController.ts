import { Request, Response, NextFunction } from 'express';
import { WallService } from '../services/WallService';

export class WallController {
  constructor(private readonly svc: WallService) {}

  getWalls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.getWalls(+req.params.roomId)); } catch (e) { next(e); }
  };
  getWall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.getWall(+req.params.roomId, +req.params.wallId)); } catch (e) { next(e); }
  };
  addWall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.status(201).json(await this.svc.addWall(+req.params.roomId, req.body)); } catch (e) { next(e); }
  };
  updateWall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.updateWall(+req.params.roomId, +req.params.wallId, req.body)); } catch (e) { next(e); }
  };
  deleteWall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.svc.deleteWall(+req.params.roomId, +req.params.wallId); res.status(204).send(); } catch (e) { next(e); }
  };
}
