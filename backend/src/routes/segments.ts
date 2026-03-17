import { Router } from 'express';
import { AppDataSource } from '../config/dataSource';
import { DimensionSegmentRepository } from '../repositories/DimensionSegmentRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { DimensionSegmentService } from '../services/DimensionSegmentService';
import { DimensionSegmentController } from '../controllers/DimensionSegmentController';
import { validateDto } from '../middleware/validateDto';
import { CreateSegmentDto } from '../dto/segment/CreateSegmentDto';
import { UpdateSegmentDto } from '../dto/segment/UpdateSegmentDto';

const router = Router();

function makeController(): DimensionSegmentController {
  const segRepo = new DimensionSegmentRepository(AppDataSource);
  const roomRepo = new RoomRepository(AppDataSource);
  const service = new DimensionSegmentService(segRepo, roomRepo);
  return new DimensionSegmentController(service);
}

router.get('/:roomId/segments', (req, res, next) => makeController().getSegments(req, res, next));
router.post('/:roomId/segments', validateDto(CreateSegmentDto), (req, res, next) =>
  makeController().addSegment(req, res, next),
);
router.patch('/:roomId/segments/:segmentId', validateDto(UpdateSegmentDto), (req, res, next) =>
  makeController().updateSegment(req, res, next),
);
router.delete('/:roomId/segments/:segmentId', (req, res, next) =>
  makeController().deleteSegment(req, res, next),
);

export default router;
