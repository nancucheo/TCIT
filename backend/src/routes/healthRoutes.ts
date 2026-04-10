import { Router } from 'express';
import { HealthController } from '@presentation/controllers/healthController';

const router = Router();
const healthController = new HealthController();

router.get('/', (req, res) => healthController.check(req, res));

export default router;
