import { Router } from 'express';
import { PostController } from '@presentation/controllers/postController';

const router = Router();
const postController = new PostController();

router.get('/', (req, res) => postController.getAll(req, res));
router.post('/', (req, res) => postController.create(req, res));

export default router;
