import express, { Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { DbTable, DbUser, ResponseCode, UserStatus } from '../../../types';
import {
  JwtPayload as MyJwtPayload,
  jwtToken,
  wrapperResult,
} from '../../../utils';

type LoginWithPwd = {
  uid: string;
  password: string;
};

type LoginWithPhone = {
  phoneNumber: string;
  code: string;
};

const loginApi = express.Router();
const { read, update } = useDbCrud();
const __jwtToken = jwtToken();

/**
 * 实现token登录、密码登录、手机验证码登录
 * 后两个登录方式每一次都会刷新token值
 */

loginApi
  /**
   * token登录
   * 检查token是否存在，如果不存在需要客户端切换非单点登录重新获取token，
   * 检查是否已登陆
   */
  .post('/login-with-token', (request, response) => {
    const { token } = request.body.data;
    useApiHandler({
      response,
      required: {
        target: request.body.data,
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
          // !检查token是否已过期，由客户端实现
          // 检查是否已在线
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
    const fields = ['uid', 'password'];
    const { uid: id, password: pwdToken } = request.body.data as LoginWithPwd;
    // 解密密码
    const { password } = __jwtToken.decode(pwdToken) as { password: string };

    let newToken = '';

    useApiHandler({
      response,
      required: {
        target: request.body.data,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          // 账号是否存在
          if (
            (await read({
              table: DbTable.ACCOUNT,
              filter: { uid: id },
            })) === null
          ) {
            response.send(wrapperResult(null, ResponseCode.NO_ACCOUNT));
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
          // token是否需要重置
          newToken = isRestToken(newToken, data.timeInfo.expiredTime, {
            uid: id,
            password,
          });
        },
        async () => {
          // 更新用户状态，登录时间
          await userUpdate(response, { uid: id }, newToken);
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
    const { phoneNumber, code } = request.body.data as LoginWithPhone;
    const fields = ['uid', 'password', 'token'];
    let newToken = '';
    useApiHandler({
      response,
      required: {
        target: request.body.data,
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
          newToken = isRestToken(token, timeInfo.expiredTime, {
            phoneNumber,
            code,
          });
        },
        async () => {
          await userUpdate(response, { phoneNumber }, newToken);
          // todo 通知其他好友已上线
        },
      ],
    });
  });

const userUpdate = async (
  response: Response,
  filter: object,
  newToken: string
) => {
  const newData = {
    status: UserStatus.ONLINE,
    'timeInfo.loginTime': Date.now(),
  };

  if (newToken !== '') {
    newData['token'] = newToken;
    __jwtToken.verify(newToken, (_, decoded) => {
      newData['timeInfo.expiredTime'] = (decoded as JwtPayload).exp;
    });
  }

  await update({
    table: DbTable.USER,
    filter,
    update: { $set: newData },
  });

  await read({ table: DbTable.USER, filter, response });
};

/**
 * 当token为空或已过期时才触发重置
 */
const isRestToken = (
  token: string,
  expiredTime: number,
  payload: MyJwtPayload
) => {
  if (!token || expiredTime < Date.now()) {
    return __jwtToken.set(payload);
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
