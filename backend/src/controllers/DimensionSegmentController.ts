import { Request, Response, NextFunction } from 'express';
import { DimensionSegmentService } from '../services/DimensionSegmentService';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';
import { SurfaceType } from '../entities/DimensionSegment';

export class DimensionSegmentController {
  constructor(private readonly service: DimensionSegmentService) {}

  getSegments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { surface } = req.query;
      if (!surface || !['floor', 'ceiling'].includes(surface as string)) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, 'surface query param must be floor or ceiling');
      }
      const roomId = parseInt(req.params.roomId, 10);
      const result = await this.service.getSegments(roomId, surface as SurfaceType);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  addSegment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const result = await this.service.addSegment(roomId, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateSegment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const segId = parseInt(req.params.segmentId, 10);
      const result = await this.service.updateSegment(roomId, segId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteSegment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const segId = parseInt(req.params.segmentId, 10);
      await this.service.deleteSegment(roomId, segId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
