import { Request, Response, NextFunction } from 'express';
import { SurfaceDimensionService } from '../services/SurfaceDimensionService';

export class SurfaceDimensionController {
  constructor(private readonly svc: SurfaceDimensionService) {}

  // Floor handlers
  getFloor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.getForRoom(+req.params.roomId, 'floor')); } catch (e) { next(e); }
  };

  upsertFloor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.upsert(+req.params.roomId, 'floor', req.body)); } catch (e) { next(e); }
  };

  deleteFloor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.svc.delete(+req.params.roomId, 'floor'); res.status(204).send(); } catch (e) { next(e); }
  };

  // Ceiling handlers
  getCeiling = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.getForRoom(+req.params.roomId, 'ceiling')); } catch (e) { next(e); }
  };

  upsertCeiling = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.upsert(+req.params.roomId, 'ceiling', req.body)); } catch (e) { next(e); }
  };

  deleteCeiling = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.svc.delete(+req.params.roomId, 'ceiling'); res.status(204).send(); } catch (e) { next(e); }
  };
}
