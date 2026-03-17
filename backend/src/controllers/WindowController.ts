import { Request, Response, NextFunction } from 'express';
import { WindowService } from '../services/WindowService';

export class WindowController {
  constructor(private readonly svc: WindowService) {}
  getWindows = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.getWindows(+req.params.wallId)); } catch (e) { next(e); }
  };
  addWindow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.status(201).json(await this.svc.addWindow(+req.params.wallId, req.body)); } catch (e) { next(e); }
  };
  updateWindow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(await this.svc.updateWindow(+req.params.wallId, +req.params.windowId, req.body)); } catch (e) { next(e); }
  };
  deleteWindow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.svc.deleteWindow(+req.params.wallId, +req.params.windowId); res.status(204).send(); } catch (e) { next(e); }
  };
}
