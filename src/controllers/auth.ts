import { NextFunction, Request, Response } from 'express';
import { authenticator } from 'otplib';
import requestIp from 'request-ip';
import {
  getSecret,
  updateSignInTry,
  generateTokenPair,
  setTokensToCookies,
  checkTryCount,
} from '@services/auth';
import { NOT_FOUND, WRONG_BODY } from '@utils/constants';

export const authController = {
  signIn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.body?.code;
      if (!code) {
        return res.status(400).json({ message: WRONG_BODY });
      }
      const db = res.locals.db;
      const secretResult = await getSecret(db);
      if (!secretResult || !secretResult.data) {
        return res.status(404).json({ message: NOT_FOUND });
      } else if (secretResult.error) {
        return res.status(400).json({ message: secretResult.error });
      }

      const secret = secretResult.data;

      const clientIp = requestIp.getClientIp(req);
      if (clientIp) {
        const curTry = await checkTryCount(clientIp, db);
        if (curTry > 2) {
          return res.status(401).json({ message: 'Permabanned :)' });
        } else if (curTry === -1) {
          return res.status(500).json();
        }

        if (authenticator.check(code, secret)) {
          await updateSignInTry(clientIp, 0, db);
          const tokens = generateTokenPair();
          setTokensToCookies(tokens, res);
          return res.status(200).json({});
        } else {
          await updateSignInTry(clientIp, curTry + 1, db);
          return res.status(401).json({ message: 'Nope' });
        }
      }
      return res.status(500).json({ message: 'No ip' });
    } catch (e: any) {
      console.error(`Error while sign in`, e.message);
      next(e);
    }
  },
  getCsrfToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json({ csrfToken: req.csrfToken() });
    } catch (e: any) {
      next(e);
    }
  },
  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({});
    } catch (e: any) {
      next(e);
    }
  },
};
