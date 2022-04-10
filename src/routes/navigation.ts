import express from 'express';
import { navigationController } from 'controllers/navigation';

export const navigationRouter = express.Router();
navigationRouter.get('/', navigationController.getAll);
navigationRouter.put('/', navigationController.update);
