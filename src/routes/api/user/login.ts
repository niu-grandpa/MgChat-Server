import dayjs from 'dayjs';
import express, { Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { useApiHandler, useDbCrud } from '../../../hooks';
import {
  CollectionName,
  ResponseCode,
  UserCollection,
  UserStatus,
} from '../../../types';
import { signData, verifyToken, wrapperResult } from '../../../utils';

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
            table: CollectionName.USERS,
            filter: { token },
          })) as unknown as UserCollection;
          // 检查token是否存在对应用户
          if (data === null) {
            response.send(wrapperResult(null, ResponseCode.EXPIRED));
            return false;
          }
          // !检查token是否已过期，由客户端实现
          // 检查是否已在线
          if (isOnline(data.status, response) === 7) {
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
    const { uid, password: pwdToken } = request.body.data as LoginWithPwd;

    // 解密密码
    let password = '';
    verifyToken(
      pwdToken,
      (res: { password: string }) => (password = res.password),
      'password'
    );

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
          const data = (await read({
            table: CollectionName.USERS,
            filter: { uid },
          })) as unknown as UserCollection;
          // 账号是否存在
          if (!data) {
            response.send(wrapperResult(null, ResponseCode.NO_ACCOUNT));
            return false;
          }
          const { timeInfo, token, status } = data;
          // 密码是否一致
          if (password !== password) {
            response.send(wrapperResult(null, ResponseCode.WRONG_PWD));
            return false;
          }
          // 是否已在线
          if (isOnline(status, response) === 7) {
            return false;
          }
          // token是否需要重置
          newToken = isRestToken(token, timeInfo.expiredTime, {
            uid,
            password,
          });
        },
        async () => {
          // 更新用户状态，登录时间
          await userUpdate(response, { uid }, newToken);
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
    const fields = ['phoneNumber', 'code'];
    let newToken = '';
    useApiHandler({
      response,
      verifyCaptcha: { phoneNumber, code },
      required: {
        target: request.body.data,
        must: fields,
        check: [{ type: 'String', fields }],
      },
      middleware: [
        async () => {
          const data = (await read({
            table: CollectionName.USERS,
            filter: { phoneNumber },
          })) as unknown as UserCollection;

          if (!data) {
            response.send(wrapperResult(data, ResponseCode.NO_ACCOUNT));
            return false;
          }

          const { timeInfo, token, status } = data;

          if (isOnline(status, response) === 7) {
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
    verifyToken(
      newToken,
      (data: JwtPayload) => (newData['timeInfo.expiredTime'] = data.exp)
    );
  }

  await update({
    table: CollectionName.USERS,
    filter,
    update: { $set: newData },
  });

  await read({ table: CollectionName.USERS, filter, response });
};

/**
 * 当token为空或已过期时才触发重置
 */
const isRestToken = (
  token: string,
  expiredTime: number,
  payload: Partial<{
    uid: string;
    code: string;
    password: string;
    phoneNumber: string;
  }>
) => {
  if (!token || expiredTime < Date.now()) {
    return signData(payload, undefined, dayjs().add(1, 'month').valueOf());
  }
  return '';
};

const isOnline = (status: UserStatus, response: Response) => {
  if (status === UserStatus.ONLINE) {
    response.status(200);
    response.send(wrapperResult(null, ResponseCode.REPEAT_LOGIN));
    return 7;
  } else {
    return false;
  }
};

export default loginApi;
