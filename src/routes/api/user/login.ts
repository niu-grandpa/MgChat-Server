import express from 'express';
import { useApiHandler, useDbCrud } from '../../../hooks';
import {
  ClientQueryFields,
  DbTable,
  DbUser,
  ResponseCode,
  UserStatus,
} from '../../../types';
import { wrapperResult } from '../../../utils';

const loginApi = express.Router();
const { read, update } = useDbCrud();

loginApi
  /**
   * 账号密码登录
   */
  .post('/login', async (request, response) => {
    const { uid, password } = request.body as ClientQueryFields;
    const fields = ['uid', 'password'];
    useApiHandler({
      response,
      required: {
        target: request.body,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          const user = (await read({
            table: DbTable.USER,
            filter: { uid },
          })) as unknown as DbUser.UserInfo;
          // 检查账号密码是否正确
          if (user === null) {
            response.send(wrapperResult(null, ResponseCode.NO_ACCOUNT));
            return false;
          }
          if (user.password !== password) {
            response.send(wrapperResult(null, ResponseCode.WRONG_PWD));
            return false;
          }
          // 检查是否已登录
          if (user.status === UserStatus.ONLINE) {
            response.send(wrapperResult(null, ResponseCode.REPEAT_LOGIN));
            return false;
          }
        },
        async () => {
          await update({
            response,
            table: DbTable.USER,
            filter: { uid },
            update: {
              // 更新登录状态与时间
              $set: {
                status: UserStatus.ONLINE,
                'timeInfo.loginTime': Date.now(),
              },
            },
          });
        },
      ],
    });
  })
  /**
   * 手机号码登录
   */
  .post('/login-with-phone');

export default loginApi;
