import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import createDatabase from './mongodb';
import { userRouter, viewsRouter } from './routes';

export const db = createDatabase('MgChat', ['USERS']);

const app = express();

app.use(logger('dev'));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 设置请求头允许跨域
 */

app.all('*', function (req, res, next) {
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
});

app.use('/', viewsRouter);
app.use('/api/user', userRouter);

export default app;
