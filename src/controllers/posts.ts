import { NextFunction, Request, Response } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  deserializeGetPostsParams,
} from '@services/posts';
import { NOT_FOUND, WRONG_PARAMS, WRONG_BODY } from '@utils/constants';

export const postsController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = deserializeGetPostsParams(req.query);
      const db = res.locals.db;
      const response = await getPosts(params, db);
      if (response.error === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while getting posts`, e.message);
      next(e);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params as { slug: string };
      if (!slug) {
        return res.status(400).json({ message: WRONG_PARAMS });
      }
      const db = res.locals.db;
      const response = await getPost(slug, db);
      if (response.error === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while getting post`, e.message);
      next(e);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      if (!body || !body.name || !body.path || typeof body.content !== 'string') {
        return res.status(400).json({ message: WRONG_BODY });
      }
      const db = res.locals.db;
      const response = await createPost(body, db);
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while creating post`, e.message);
      next(e);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      if (!id) {
        return res.status(400).json({ message: WRONG_PARAMS });
      }
      const body = req.body;
      if (!body || !body.name || !body.path || typeof body.content !== 'string') {
        return res.status(400).json({ message: WRONG_BODY });
      }
      const db = res.locals.db;
      const response = await updatePost({ id, ...body }, db);
      if (response.error === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while updating post`, e.message);
      next(e);
    }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      if (!id) {
        return res.status(400).json({ message: WRONG_PARAMS });
      }
      const db = res.locals.db;
      const response = await deletePost(id, db);
      if (response.error === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while updating post`, e.message);
      next(e);
    }
  },
};
