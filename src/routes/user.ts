// 面向登录、注册、找回密码以及查询用户信息的接口
import express, { Request, Response } from 'express';
import { useCheckParams, useCreate, useRead, useUpdate } from '../hooks';
import { useGenerateUid } from '../hooks/useGenerateUid';
import { ClientQueryFields, DbTableSructure, UserInfo } from '../types';
import { wrapperResult } from '../utils';
import { loginFields, registerFields } from './fields';

const userRouter = express.Router();

const crudHandler = ({
  req,
  res,
  next,
  fields,
}: {
  req: Request;
  res: Response;
  fields: string[];
  next: () => any;
}) => {
  const params = req.body as ClientQueryFields;
  const pass = useCheckParams(fields, params);
  if (pass === true) {
    next();
  } else {
    res.status(pass.code);
    res.send(pass.msg);
  }
};

const initNewUserData = async (data: UserInfo) => {
  data.icon = '';
  data.city = '';
  data.age = 0;
  data.level = 1;
  data.count = 0;
  data.credit = 0;
  data.gender = 2;
  data.privilege = 0;
  data.friends = [];
  data.groups = [];
  data.activeTime = 0;
  data.account = await useGenerateUid();
};

userRouter
  /**查询用户信息 */
  .get('/info', async (req, res) =>
    crudHandler({
      req,
      res,
      fields: ['account'],
      next: () => useRead({ req, res }),
    })
  )
  /**登录 */
  .post('/login', async (req, res) => {
    crudHandler({
      req,
      res,
      fields: loginFields.upw,
      next: async () => {
        const data = await useRead({
          req,
          res,
          noSend: true,
        });
        // 判断用户是否存在
        if (data === null) {
          res.status(500);
          res.send(wrapperResult(data, ''));
        } else {
          const { allUsers } = data as unknown as DbTableSructure;
          const { account, count } = allUsers[0];
          // 更新登录次数
          await useUpdate({
            req,
            res,
            noSend: true,
            table: 'allUsers',
            filter: { account },
            newData: { 'allUsers.$.count': count + 1 },
          });
          allUsers[0].count++;
          res.send(wrapperResult(allUsers[0], 'success'));
        }
      },
    });
  })
  /**退出登录 */
  .post('/logout', async (req, res) => {})
  /**注册 */
  .post('/register', (req, res) =>
    crudHandler({
      req,
      res,
      fields: registerFields,
      next: () => {
        // 初始化新用户数据
        initNewUserData(req.body).then(() =>
          useCreate({ req, res, table: 'allUsers' })
        );
      },
    })
  )
  /**找回密码 */
  .post('/forget', (req, res) => {});

export { userRouter };
