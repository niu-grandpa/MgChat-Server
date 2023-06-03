import express from 'express';
import { useApiHandler, useDbCrud, useGenerateUid } from '../../../hooks';
import { DbTable, ResponseCode, UserGender, UserStatus } from '../../../types';
import { wrapperResult } from '../../../utils';

const registerApi = express.Router();

const { read, create } = useDbCrud();

const initUserData = () => ({
  icon: '',
  city: '',
  age: 0,
  status: UserStatus.OFFLINE,
  level: 0,
  gender: UserGender.NONE,
  credit: 0,
  privilege: 0,
  upgradeDays: 0,
  friends: [],
  groups: [],
  timeInfo: {
    loginTime: '',
    logoutTime: '',
    activeTime: 0,
    createTime: Date.now(),
  },
});

registerApi.post('/register', (request, response) => {
  const { phoneNumber } = request.body;
  const fields = ['nickname', 'phoneNumber', 'code', 'password'];
  let account = '';

  useApiHandler({
    response,
    required: {
      target: request.body,
      must: fields,
      check: [{ type: 'String', fields }],
    },
    middleware: [
      async () => {
        if (
          (await read({ table: DbTable.USER, filter: { phoneNumber } })) !==
          null
        ) {
          response.send(wrapperResult(null, ResponseCode.EXISTED));
          return false;
        }
      },
      async () => {
        account = await useGenerateUid();
        await create({
          table: DbTable.USER,
          request,
          response,
          filter: { phoneNumber },
          newData: { ...initUserData(), ...request.body, account },
        });
      },
      async () => {
        // 初始化新用户的好友申请表数据
        await create({
          table: DbTable.APPLY,
          filter: { account },
          newData: { list: [] },
        });
      },
    ],
  });
});

export default registerApi;
