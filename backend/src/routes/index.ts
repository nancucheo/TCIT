import { Router } from 'express';
import healthRoutes from '@routes/healthRoutes';
import postRoutes from '@routes/postRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/posts', postRoutes);

export default router;
