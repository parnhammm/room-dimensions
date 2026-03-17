import { Router } from 'express';
import { AppDataSource } from '../config/dataSource';
import { AppSettingsRepository } from '../repositories/AppSettingsRepository';
import { SettingsService } from '../services/SettingsService';
import { SettingsController } from '../controllers/SettingsController';
import { validateDto } from '../middleware/validateDto';
import { UpdateSettingsDto } from '../dto/settings/UpdateSettingsDto';

const router = Router();

function makeController(): SettingsController {
  const repo = new AppSettingsRepository(AppDataSource);
  const service = new SettingsService(repo);
  return new SettingsController(service);
}

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: Get current measurement unit
 *     responses:
 *       200:
 *         description: Current settings
 */
router.get('/', (req, res, next) => makeController().getSettings(req, res, next));

/**
 * @openapi
 * /settings:
 *   patch:
 *     summary: Update measurement unit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               measurementUnit:
 *                 type: string
 *                 enum: [m, cm, ft, in]
 *     responses:
 *       200:
 *         description: Updated settings
 *       400:
 *         description: Validation error
 */
router.patch('/', validateDto(UpdateSettingsDto), (req, res, next) =>
  makeController().updateSettings(req, res, next),
);

export default router;
