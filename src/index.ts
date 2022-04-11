/// <reference path="../environment.d.ts" />
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { authRouter } from '@routes/auth';
import { navigationRouter } from '@routes/navigation';
import { postsRouter } from '@routes/posts';
import { initMongoDb } from '@services/mongodb';
import { processJwtVerification } from '@services/auth';

const app = express();
const hostname = process.env.HOSTNAME;
const port = +process.env.PORT;

const csrfProtection = csrf({
  cookie: {
    domain: process.env.COOKIE_DOMAIN,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});

initMongoDb().then((db) => {
  app.use(helmet());
  app.use(helmet.xssFilter());
  app.use(helmet.hsts());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.noSniff());

  app.use(express.json());

  app.use(
    cors({
      origin: [process.env.ORIGIN_MAIN, process.env.ORIGIN_ADMIN],
      credentials: true,
      maxAge: 300,
    })
  );

  app.use(cookieParser());
  app.use(csrfProtection);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.db = db;
    next();
  });

  app.use(processJwtVerification);

  app.get('/', (req: Request, res: Response, next: NextFunction) => {
    return res.json({
      message:
        'After 9 years in development, hopefully it would have been worth the wait',
    });
  });

  app.use('/auth', authRouter);
  app.use('/posts', postsRouter);
  app.use('/navigation', navigationRouter);

  app.listen(port, hostname, async () => {
    console.log(`server is up at ${hostname}:${port}`);
  });
});
