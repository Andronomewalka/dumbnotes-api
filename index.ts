/// <reference path="./environment.d.ts" />
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { authRouter } from 'routes/auth';
import { navigationRouter } from 'routes/navigation';
import { postsRouter } from 'routes/posts';
import { initMongoDb } from 'services/mongodb';
import { processJwtVerification } from 'services/auth';

const app = express();
const hostname = '127.0.0.1';
const port = 8080;

const csrfProtection = csrf({
  cookie: true,
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

  app.use((req, res, next) => {
    res.locals.db = db;
    next();
  });

  app.use(processJwtVerification);

  app.use('/auth', authRouter);
  app.use('/posts', postsRouter);
  app.use('/navigation', navigationRouter);

  app.listen(port, hostname, async () => {
    console.log(`server is up at ${hostname}:${port}`);
  });
});
