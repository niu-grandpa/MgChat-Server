import express from 'express';
import { useDbCrud } from '../../../hooks';
import {
  CollectionName,
  ResponseCode,
  UserCollection,
  UserStatus,
} from '../../../types';
import { settlementUserLevelAndCredit } from './../../../core/index';
import { wrapperResult } from './../../../utils';

const logoutApi = express.Router();
const { read, update } = useDbCrud();

/**
 * 退出登录
 * 无论登录方式是通过账号密码还是手机，最终退出登录都要用到账号去查询用户表
 */
logoutApi.post('/logout', async (request, response) => {
  const common = {
    table: CollectionName.USERS,
    filter: { uid: request.body.data.uid },
  };
  const user = (await read(common)) as unknown as UserCollection;

  if (user.status === UserStatus.OFFLINE) {
    response.send(wrapperResult(null, ResponseCode.USER_IS_OFFLINE));
    return;
  }

  user.status = UserStatus.OFFLINE;
  user.timeInfo.logoutTime = Date.now();

  settlementUserLevelAndCredit(user);

  await update({
    ...common,
    response,
    update: { $set: { ...user } },
  });
});

export default logoutApi;
