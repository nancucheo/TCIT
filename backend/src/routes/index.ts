import { Router } from 'express';
import healthRoutes from '@routes/healthRoutes';

const router = Router();

router.use('/health', healthRoutes);

// Post routes will be mounted here once the PostController is implemented
// Example: router.use('/posts', postRoutes);

export default router;
