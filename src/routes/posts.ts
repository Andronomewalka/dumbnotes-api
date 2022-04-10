import express from 'express';
import { postsController } from 'controllers/posts';

export const postsRouter = express.Router();
postsRouter.get('/:slug', postsController.get);
postsRouter.get('/', postsController.getAll);
postsRouter.post('/', postsController.create);
postsRouter.put('/:id', postsController.update);
postsRouter.delete('/:id', postsController.delete);
