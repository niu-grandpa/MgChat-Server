import express, { Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { DbTable, DbUser, ResponseCode, UserStatus } from '../../../types';
import { jwtToken, wrapperResult } from '../../../utils';

interface LoginWithPwd {
  uid: string;
  password: string;
}

interface LoginWithPhone {
  phoneNumber: string;
  code: string;
}

const loginApi = express.Router();
const { read, update } = useDbCrud();
const __jwtToken = jwtToken();

/**
 * 实现单点登录、密码登录、手机验证码登录
 * 后两个登录方式每一次都会刷新token值
 */

loginApi
  /**
   * 单点登录
   * 检查token是否存在，如果不存在需要客户端切换非单点登录重新获取token，
   * 检查是否已登陆
   */
  .post('/login-with-token', (request, response) => {
    const { token } = request.body;
    useApiHandler({
      response,
      required: {
        target: request.body,
      },
      middleware: [
        async () => {
          const data = (await read({
            table: DbTable.USER,
            filter: { token },
          })) as unknown as DbUser.UserInfo;
          // 检查token是否存在对应用户
          if (data === null) {
            response.send(wrapperResult(null, ResponseCode.EXPIRED));
            return false;
          }
          if (isOnline(data.status, response)) {
            return false;
          }
        },
        async () => await userUpdate(response, { token }, token),
      ],
    });
  })

  /**
   * 密码登录
   * 检查账号是否存在、密码是否正确、是否已在线、token是否已过期
   */
  .post('/login-with-pwd', (request, response) => {
    const { uid: id, password } = request.body as LoginWithPwd;
    const fields = ['uid', 'password', 'token'];

    let _token = '';

    useApiHandler({
      response,
      required: {
        target: request.body,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          // 账号是否存在
          if (
            (await read({
              table: DbTable.ACCOUNT,
              response,
              filter: { uid: id },
            })) === null
          ) {
            return false;
          }
        },
        async () => {
          const data = (await read({
            table: DbTable.USER,
            filter: { uid: id },
          })) as unknown as DbUser.UserInfo;
          // 密码是否一致
          if (password !== data.password) {
            response.send(wrapperResult(null, ResponseCode.WRONG_PWD));
            return false;
          }
          // 是否已在线
          if (isOnline(data.status, response)) {
            return false;
          }
          _token = isRestToken(_token, data.timeInfo.expiredTime, id);
        },
        async () => {
          // 更新用户状态，登录时间
          await userUpdate(response, { uid: id }, _token);
          // todo 通知其他好友已上线
        },
      ],
    });
  })

  /**
   * 手机验证码登录
   * 检查手机号是否已注册、是否已在线、token是否已过期，如果没有则客户端引导用户注册
   */
  .post('/login-with-phone', (request, response) => {
    const { phoneNumber, code } = request.body as LoginWithPhone;
    const fields = ['uid', 'password', 'token'];
    let _token = '';
    useApiHandler({
      response,
      required: {
        target: request.body,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          const { timeInfo, token, status } = (await read({
            table: DbTable.USER,
            filter: { phoneNumber },
          })) as unknown as DbUser.UserInfo;

          if (isOnline(status, response)) {
            return false;
          }
          _token = isRestToken(token, timeInfo.expiredTime, phoneNumber + code);
        },
        async () => {
          await userUpdate(response, { phoneNumber }, _token);
          // todo 通知其他好友已上线
        },
      ],
    });
  });

const userUpdate = async (
  response: Response,
  filter: object,
  token: string
) => {
  const newData = {
    status: UserStatus.ONLINE,
    'timeInfo.loginTime': Date.now(),
  };

  if (token !== '') {
    newData['token'] = token;
    __jwtToken.verify(token, (_, decoded) => {
      newData['timeInfo.expiredTime'] = (decoded as JwtPayload).exp;
    });
  }

  await update({
    table: DbTable.USER,
    filter,
    response,
    update: newData,
  });
};

/**
 * 当token为空或已过期时才触发重置
 */
const isRestToken = (token: string, expiredTime: number, val: string) => {
  if (!token || expiredTime < Date.now()) {
    return __jwtToken.set({ key: val });
  }
  return '';
};

const isOnline = (status: UserStatus, response: Response) => {
  if (status === UserStatus.ONLINE) {
    response.send(wrapperResult(null, ResponseCode.REPEAT_LOGIN));
    return true;
  }
};

export default loginApi;
