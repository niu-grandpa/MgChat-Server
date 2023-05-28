// 面向登录、注册、找回密码以及查询用户信息的接口
import express from 'express';
import { db } from '../app';
import { useCreate } from '../hooks';
import { ClientQueryFields } from '../types';

const userRouter = express.Router();

userRouter
  /**查询用户信息 */
  .get('/info', async (req, res) => {
    const params = req.body as ClientQueryFields;
    const d = await db.collection('data').find({}).toArray();
    res.send(d);
    // const pass = useCheckParams(['_id'], params);
    // if (pass === true) {
    //   useRead({ req, res, table: 'data' });
    // } else {
    //   res.status(pass.code);
    //   res.send(pass.msg);
    // }
  })
  /**登录 */
  .post('/login', async (req, res) => {})
  /**注册 */
  .post('/register', (req, res) => useCreate({ table: 'data', req, res }))
  /**找回密码 */
  .post('/forget', (req, res) => {});

export { userRouter };
