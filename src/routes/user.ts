// 面向登录、注册、找回密码以及查询用户信息的接口
import express from 'express';
import { useCreate, useRead } from '../hooks';

const userRouter = express.Router();

userRouter
  .get('/info', (req, res) => useRead({ table: 'USERS', req, res }))
  .post('/login', (req, res) => {})
  .post('/register', (req, res) => useCreate({ table: 'USERS', req, res }))
  .post('/forget', (req, res) => {});

export { userRouter };
