import { NextFunction, Request, Response } from 'express';
import { getNavigation, updateNavigation, NavNodeBaseType } from '@services/navigation';
import { NOT_FOUND, WRONG_BODY } from '@utils/constants';

export const navigationController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = res.locals.db;
      const response = await getNavigation(db);
      if (response.error === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while getting navigation`, e.message);
      next(e);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { navItemsContent } = req.body as { navItemsContent: NavNodeBaseType[] };
      if (!navItemsContent) {
        return res.status(400).json({ message: WRONG_BODY });
      }
      const db = res.locals.db;
      const response = await updateNavigation(navItemsContent, db);
      if (response.error === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      return res.json(response);
    } catch (e: any) {
      console.error(`Error while updating navigation`, e.message);
      next(e);
    }
  },
};
