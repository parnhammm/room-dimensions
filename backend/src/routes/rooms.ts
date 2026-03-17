import { Router } from 'express';
import { AppDataSource } from '../config/dataSource';
import { RoomRepository } from '../repositories/RoomRepository';
import { AppSettingsRepository } from '../repositories/AppSettingsRepository';
import { RoomService } from '../services/RoomService';
import { RoomController } from '../controllers/RoomController';
import { validateDto } from '../middleware/validateDto';
import { CreateRoomDto } from '../dto/room/CreateRoomDto';
import { UpdateRoomDto } from '../dto/room/UpdateRoomDto';

const router = Router();

function makeController(): RoomController {
  const roomRepo = new RoomRepository(AppDataSource);
  const settingsRepo = new AppSettingsRepository(AppDataSource);
  const service = new RoomService(roomRepo, settingsRepo);
  return new RoomController(service);
}

/**
 * @openapi
 * /rooms:
 *   get:
 *     summary: List all rooms
 *     responses:
 *       200:
 *         description: Array of rooms
 */
router.get('/', (req, res, next) => makeController().listRooms(req, res, next));

/**
 * @openapi
 * /rooms/summary:
 *   get:
 *     summary: Get print summary grouped by floor
 *     responses:
 *       200:
 *         description: Print summary data
 */
// IMPORTANT: Register /summary BEFORE /:roomId to prevent Express routing conflict
router.get('/summary', (req, res, next) => makeController().getSummary(req, res, next));

/**
 * @openapi
 * /rooms/{roomId}:
 *   get:
 *     summary: Get room detail
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room detail with segments and walls
 *       404:
 *         description: Not found
 */
router.get('/:roomId', (req, res, next) => makeController().getRoom(req, res, next));

/**
 * @openapi
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, floor]
 *             properties:
 *               label:
 *                 type: string
 *               floor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created room
 *       400:
 *         description: Validation error
 */
router.post('/', validateDto(CreateRoomDto), (req, res, next) =>
  makeController().createRoom(req, res, next),
);

/**
 * @openapi
 * /rooms/{roomId}:
 *   patch:
 *     summary: Update a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated room
 *       404:
 *         description: Not found
 */
router.patch('/:roomId', validateDto(UpdateRoomDto), (req, res, next) =>
  makeController().updateRoom(req, res, next),
);

/**
 * @openapi
 * /rooms/{roomId}:
 *   delete:
 *     summary: Delete a room
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
 *         description: Not found
 */
router.delete('/:roomId', (req, res, next) => makeController().deleteRoom(req, res, next));

export default router;
