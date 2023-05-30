import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import createDatabase from './mongodb';
import {
  forgetPwApi,
  infoApi,
  loginApi,
  logoutApi,
  registerApi,
  viewsRouter,
} from './routes';

export const db = createDatabase('MgChat', 'data');

const app = express();

app
  .use(logger('dev'))
  .use(cookieParser())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(express.static(path.join(__dirname, 'public')))

  .all('*', (req, res, next) => {
    const { origin, Origin, referer, Referer } = req.headers;
    const allowOrigin = origin || Origin || referer || Referer || '*';
    res.header('Access-Control-Allow-Origin', allowOrigin);
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true'); //可以带cookies
    res.header('X-Powered-By', 'Express');
    if (req.method == 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  })

  .use('/', viewsRouter)
  .use('/api/user', loginApi)
  .use('/api/user', logoutApi)
  .use('/api/user', registerApi)
  .use('/api/user', forgetPwApi)
  .use('/api/user', infoApi);

export default app;
