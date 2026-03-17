import { Router } from 'express';
import { AppDataSource } from '../config/dataSource';
import { WallRepository } from '../repositories/WallRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { WallService } from '../services/WallService';
import { WallController } from '../controllers/WallController';
import { validateDto } from '../middleware/validateDto';
import { CreateWallDto } from '../dto/wall/CreateWallDto';
import { UpdateWallDto } from '../dto/wall/UpdateWallDto';

const router = Router();
function ctrl(): WallController {
  return new WallController(new WallService(new WallRepository(AppDataSource), new RoomRepository(AppDataSource)));
}

router.get('/:roomId/walls', (q, s, n) => ctrl().getWalls(q, s, n));
router.get('/:roomId/walls/:wallId', (q, s, n) => ctrl().getWall(q, s, n));
router.post('/:roomId/walls', validateDto(CreateWallDto), (q, s, n) => ctrl().addWall(q, s, n));
router.patch('/:roomId/walls/:wallId', validateDto(UpdateWallDto), (q, s, n) => ctrl().updateWall(q, s, n));
router.delete('/:roomId/walls/:wallId', (q, s, n) => ctrl().deleteWall(q, s, n));

export default router;
