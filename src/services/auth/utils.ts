import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Db } from 'mongodb';
import { NOT_FOUND } from '@utils/constants';
import { createSignInTry } from './createSignInTry';
import { getSignInTry } from './getSignInTry';
import { TokenPairType } from './types';

const generatePayload = () => {
  return {
    iss: process.env.AUTH_ISSUER,
    sub: process.env.AUTH_SUBJECT,
    aud: process.env.AUTH_AUDIENCE,
  };
};

const generateAccessToken = () => {
  return jwt.sign(generatePayload(), process.env.AUTH_SECRET, {
    expiresIn: `${process.env.AUTH_ACCESS_LIFETIME_S}s`,
  });
};

const generateRefreshToken = () => {
  return jwt.sign(generatePayload(), process.env.AUTH_SECRET, {
    expiresIn: `${process.env.AUTH_REFRESH_LIFETIME_S}s`,
  });
};

export const generateTokenPair = (): TokenPairType => {
  return {
    accessToken: generateAccessToken(),
    refreshToken: generateRefreshToken(),
  };
};

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.AUTH_SECRET);
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
    domain: process.env.COOKIE_DOMAIN,
    maxAge: parseInt(process.env.AUTH_ACCESS_LIFETIME_S) * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  res.cookie('X-DumbNotes-Refresh-Token', tokens.refreshToken, {
    domain: process.env.COOKIE_DOMAIN,
    maxAge: parseInt(process.env.AUTH_REFRESH_LIFETIME_S) * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
};

export const checkTryCount = async (clientIp: string, db: Db) => {
  let curTry = 0;
  const ipTries = await getSignInTry(clientIp, db);
  if (!ipTries || typeof ipTries.data !== 'number') {
    return -1;
  } else if (ipTries.error === NOT_FOUND) {
    const addIpTryResult = await createSignInTry(clientIp, db);
    if (addIpTryResult.error) {
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

    const accessToken = req.cookies['X-DumbNotes-Access-Token']?.split(' ')[0];
    if (accessToken) {
      const accessTokenVerified = verifyToken(accessToken);
      if (accessTokenVerified) {
        return next();
      }
    }
    const refreshToken = req.cookies['X-DumbNotes-Refresh-Token']?.split(' ')[0];
    if (refreshToken) {
      const refreshTokenVerified = verifyToken(refreshToken);
      if (refreshTokenVerified) {
        const tokens = generateTokenPair();
        setTokensToCookies(tokens, res);
        return next();
      }
    }
  } catch (e: any) {
    console.log('jwt validation error', e);
  }
  return res.status(401).json({ message: 'Not authorized' });
};
