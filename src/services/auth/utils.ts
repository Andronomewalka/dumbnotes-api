import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Db } from 'mongodb';
import requestIp from 'request-ip';
import { NOT_FOUND } from '@utils/constants';
import { createSignInTry } from './createSignInTry';
import { getSignInTry } from './getSignInTry';
import { TokenPairType } from './types';
import { updateSignInTry } from './updateSignInTry';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    cip: string;
  }
}

const generatePayload = (clientIp: string) => {
  return {
    iss: process.env.AUTH_ISSUER,
    sub: process.env.AUTH_SUBJECT,
    aud: process.env.AUTH_AUDIENCE,
    cip: clientIp,
  };
};

const generateAccessToken = (clientIp: string) => {
  return jwt.sign(generatePayload(clientIp), process.env.AUTH_SECRET, {
    expiresIn: `${process.env.AUTH_ACCESS_LIFETIME_S}s`,
  });
};

const generateRefreshToken = (clientIp: string) => {
  return jwt.sign(generatePayload(clientIp), process.env.AUTH_SECRET, {
    expiresIn: `${process.env.AUTH_REFRESH_LIFETIME_S}s`,
  });
};

export const generateTokenPair = (clientIp: string): TokenPairType => {
  return {
    accessToken: generateAccessToken(clientIp),
    refreshToken: generateRefreshToken(clientIp),
  };
};

const verifyToken = (token: string, clientIp: string) => {
  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    if (typeof decoded === 'object' && decoded.cip === clientIp) {
      return decoded;
    }
  } catch (e: any) {
    console.log('verifyToken error', e);
  }
  return null;
};

export const setTokensToCookies = (
  tokens: TokenPairType,
  res: Response<any, Record<string, any>>
) => {
  res.cookie('X-DumbNotes-Access-Token', tokens.accessToken, {
    maxAge: parseInt(process.env.AUTH_ACCESS_LIFETIME_S) * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.cookie('X-DumbNotes-Refresh-Token', tokens.refreshToken, {
    maxAge: parseInt(process.env.AUTH_REFRESH_LIFETIME_S) * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const checkTryCount = async (clientIp: string, db: Db) => {
  let curTry = 0;
  const ipTries = await getSignInTry(clientIp, db);
  if (!ipTries || typeof ipTries.data !== 'number') {
    return -1;
  } else if (ipTries.error === NOT_FOUND) {
    const addIpTryResult = await createSignInTry(clientIp, db);
    if (!addIpTryResult) {
      return -1;
    }
    curTry = 0;
  } else {
    curTry = ipTries.data;
  }

  return curTry;
};

export const processJwtVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      (req.method === 'GET' && req.url !== '/auth/verify-tokens') ||
      req.url === '/auth/sign-in'
    ) {
      return next(); // no jwt validation for get requests and sign-in
    }

    const clientIp = requestIp.getClientIp(req);
    const db = res.locals.db;

    if (clientIp) {
      const curTry = await checkTryCount(clientIp, db);
      if (curTry > 2) {
        return res.status(401).json({ message: 'Permabanned :)' });
      } else if (curTry === -1) {
        return res.status(500).json();
      }

      const accessToken = req.cookies['X-DumbNotes-Access-Token']?.split(' ')[0];
      if (accessToken) {
        const accessTokenVerified = verifyToken(accessToken, clientIp);
        if (accessTokenVerified) {
          return next();
        }
      }
      const refreshToken = req.cookies['X-DumbNotes-Refresh-Token']?.split(' ')[0];
      if (refreshToken) {
        const refreshTokenVerified = verifyToken(refreshToken, clientIp);
        if (refreshTokenVerified) {
          const tokens = generateTokenPair(clientIp);
          setTokensToCookies(tokens, res);
          await updateSignInTry(clientIp, 0, db);
          return next();
        }
      }
      await updateSignInTry(clientIp, curTry + 1, db);
    }
  } catch (e: any) {
    console.log('jwt validation error', e);
  }
  return res.status(401).json({ message: 'Not authorized' });
};
