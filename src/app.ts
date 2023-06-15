import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import onRegisterApi from './routes';

const app = express();

app
  .use(logger('dev'))
  .use(cookieParser())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use('/', express.static(path.join(__dirname, 'public')));

onRegisterApi(app);

export default app;
