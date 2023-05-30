import express from 'express';
import { crudHandler } from '.';
import { useRead, useUpdate } from '../../../hooks';
import {
  ClientQueryFields,
  DbTableSructure,
  ResponseCode,
  UserStatus,
} from '../../../types';
import { wrapperResult } from '../../../utils';
import { loginFields } from '../../fields';

const loginApi = express.Router();

loginApi.post('/login', async (req, res) => {
  crudHandler({
    req,
    res,
    fields: loginFields.upw,
    next: async () => {
      const { account, password, status, loginTime } =
        req.body as ClientQueryFields;

      const data = await useRead({
        req,
        res,
        noSend: true,
        filter: { account },
      });
      // 检查用户是否存在
      if (data === null) {
        res.send(wrapperResult(null, ResponseCode.NONE));
        return;
      }
      // 查询出来的结构是 { key: [{}] }，因此需要先解构出对象再结构出数组
      const { allUsers } = data as unknown as DbTableSructure;

      const [user] = allUsers;

      // 检查密码是否一致
      if (user.password !== password) {
        res.send(wrapperResult(null, ResponseCode.WRONG_PWD));
        return;
      }

      // 更新用户在线状态和登录时间
      await useUpdate({
        req,
        res,
        noSend: true,
        tableProps: 'allUsers',
        filter: { account, password },
        newData: {
          'allUsers.$.loginTime': loginTime,
          'allUsers.$.status': status || UserStatus.ONLINE,
        },
      });

      user.status = status;
      user.loginTime = loginTime;

      // todo与客户端建立tcp连接, websocket
      res.send(wrapperResult(user, ResponseCode.SUCCESS));
    },
  });
});

loginApi.post('/login-with-phone');

export { loginApi };
