import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/SettingsService';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.settingsService.getSettings();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.settingsService.updateSettings(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
