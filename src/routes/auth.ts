import express from 'express';
import { authController } from 'controllers/auth';

export const authRouter = express.Router();
authRouter.post('/sign-in', authController.signIn);
authRouter.get('/csrf', authController.getCsrfToken);
authRouter.get('/verify-tokens', authController.verify);
