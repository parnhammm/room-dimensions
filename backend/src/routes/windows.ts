import { Router } from 'express';
import { AppDataSource } from '../config/dataSource';
import { WindowRepository } from '../repositories/WindowRepository';
import { WallRepository } from '../repositories/WallRepository';
import { WindowService } from '../services/WindowService';
import { WindowController } from '../controllers/WindowController';
import { validateDto } from '../middleware/validateDto';
import { CreateWindowDto } from '../dto/window/CreateWindowDto';
import { UpdateWindowDto } from '../dto/window/UpdateWindowDto';

const router = Router();
function ctrl() {
  return new WindowController(new WindowService(new WindowRepository(AppDataSource), new WallRepository(AppDataSource)));
}

router.get('/:roomId/walls/:wallId/windows', (q, s, n) => ctrl().getWindows(q, s, n));
router.post('/:roomId/walls/:wallId/windows', validateDto(CreateWindowDto), (q, s, n) => ctrl().addWindow(q, s, n));
router.patch('/:roomId/walls/:wallId/windows/:windowId', validateDto(UpdateWindowDto), (q, s, n) => ctrl().updateWindow(q, s, n));
router.delete('/:roomId/walls/:wallId/windows/:windowId', (q, s, n) => ctrl().deleteWindow(q, s, n));

export default router;
