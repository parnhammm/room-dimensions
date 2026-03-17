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

/**
 * @openapi
 * /rooms/{roomId}/segments:
 *   get:
 *     summary: List segments for a room surface
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: surface
 *         required: true
 *         schema: { type: string, enum: [floor, ceiling] }
 *     responses:
 *       200:
 *         description: Array of segments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SegmentResponse'
 *   post:
 *     summary: Create a segment for a room surface
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, measurement, surfaceType]
 *             properties:
 *               label:
 *                 type: string
 *               measurement:
 *                 type: number
 *                 minimum: 0.0001
 *               surfaceType:
 *                 type: string
 *                 enum: [floor, ceiling]
 *               width:
 *                 type: number
 *                 minimum: 0.0001
 *                 description: Optional horizontal width dimension
 *               length:
 *                 type: number
 *                 minimum: 0.0001
 *                 description: Optional horizontal length dimension
 *     responses:
 *       201:
 *         description: Created segment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SegmentResponse'
 *
 * components:
 *   schemas:
 *     SegmentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         label:
 *           type: string
 *         measurement:
 *           type: number
 *         width:
 *           type: number
 *           nullable: true
 *           description: Optional horizontal width dimension
 *         length:
 *           type: number
 *           nullable: true
 *           description: Optional horizontal length dimension
 *         surfaceType:
 *           type: string
 *           enum: [floor, ceiling]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /rooms/{roomId}/segments/{segmentId}:
 *   patch:
 *     summary: Update a segment
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: segmentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               measurement:
 *                 type: number
 *                 minimum: 0.0001
 *               width:
 *                 type: number
 *                 minimum: 0.0001
 *               length:
 *                 type: number
 *                 minimum: 0.0001
 *     responses:
 *       200:
 *         description: Updated segment
 *   delete:
 *     summary: Delete a segment
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: segmentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted
 */
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
