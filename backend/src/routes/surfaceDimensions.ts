import { Router } from 'express';
import { AppDataSource } from '../config/dataSource';
import { SurfaceDimensionRepository } from '../repositories/SurfaceDimensionRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { SurfaceDimensionService } from '../services/SurfaceDimensionService';
import { SurfaceDimensionController } from '../controllers/SurfaceDimensionController';
import { validateDto } from '../middleware/validateDto';
import { UpsertSurfaceDimensionDto } from '../dto/surface-dimension/UpsertSurfaceDimensionDto';

const router = Router({ mergeParams: true });

function ctrl(): SurfaceDimensionController {
  return new SurfaceDimensionController(
    new SurfaceDimensionService(
      new SurfaceDimensionRepository(AppDataSource),
      new RoomRepository(AppDataSource),
    ),
  );
}

/**
 * @openapi
 * /rooms/{roomId}/floor-dimensions:
 *   get:
 *     summary: Get floor dimension for a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Floor dimension (width × length)
 *       404:
 *         description: Room or floor dimension not found
 */
router.get('/floor-dimensions', (q, s, n) => ctrl().getFloor(q, s, n));

/**
 * @openapi
 * /rooms/{roomId}/floor-dimensions:
 *   put:
 *     summary: Create or update floor dimension for a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [width, length]
 *             properties:
 *               width:
 *                 type: number
 *                 minimum: 0.0001
 *               length:
 *                 type: number
 *                 minimum: 0.0001
 *     responses:
 *       200:
 *         description: Created or updated floor dimension
 *       400:
 *         description: Validation error (width/length missing, zero, or negative)
 *       404:
 *         description: Room not found
 */
router.put('/floor-dimensions', validateDto(UpsertSurfaceDimensionDto), (q, s, n) => ctrl().upsertFloor(q, s, n));

/**
 * @openapi
 * /rooms/{roomId}/floor-dimensions:
 *   delete:
 *     summary: Remove floor dimension for a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Room or floor dimension not found
 */
router.delete('/floor-dimensions', (q, s, n) => ctrl().deleteFloor(q, s, n));

/**
 * @openapi
 * /rooms/{roomId}/ceiling-dimensions:
 *   get:
 *     summary: Get ceiling dimension for a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ceiling dimension (width × length)
 *       404:
 *         description: Room or ceiling dimension not found
 */
router.get('/ceiling-dimensions', (q, s, n) => ctrl().getCeiling(q, s, n));

/**
 * @openapi
 * /rooms/{roomId}/ceiling-dimensions:
 *   put:
 *     summary: Create or update ceiling dimension for a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [width, length]
 *             properties:
 *               width:
 *                 type: number
 *                 minimum: 0.0001
 *               length:
 *                 type: number
 *                 minimum: 0.0001
 *     responses:
 *       200:
 *         description: Created or updated ceiling dimension
 *       400:
 *         description: Validation error (width/length missing, zero, or negative)
 *       404:
 *         description: Room not found
 */
router.put('/ceiling-dimensions', validateDto(UpsertSurfaceDimensionDto), (q, s, n) => ctrl().upsertCeiling(q, s, n));

/**
 * @openapi
 * /rooms/{roomId}/ceiling-dimensions:
 *   delete:
 *     summary: Remove ceiling dimension for a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Room or ceiling dimension not found
 */
router.delete('/ceiling-dimensions', (q, s, n) => ctrl().deleteCeiling(q, s, n));

export default router;
