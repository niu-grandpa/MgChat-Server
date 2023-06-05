import express from 'express';
import { useApiHandler, useDbCrud, useGenerateUid } from '../../../hooks';
import { DbTable, ResponseCode, UserGender, UserStatus } from '../../../types';
import { jwtToken, wrapperResult } from '../../../utils';

interface RegisterFields {
  nickname: string;
  phoneNumber: string;
  password: string;
  code: string;
  age?: number;
  gender?: UserGender;
}

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
    expiredTime: 0,
    createTime: Date.now(),
  },
});

registerApi.post('/register', (request, response) => {
  const { phoneNumber, code } = request.body as RegisterFields;
  const fields = ['nickname', 'phoneNumber', 'code', 'password'];
  let uid = '';

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
        uid = await useGenerateUid();
        await create({
          table: DbTable.USER,
          request,
          response,
          newData: {
            uid,
            token: jwtToken().set({ key: phoneNumber + code }),
            ...initUserData(),
            ...request.body,
          },
        });
      },
      async () => {
        // 初始化新用户好友申请表数据
        await create({ table: DbTable.APPLY, newData: { list: [] } });
      },
    ],
  });
});

export default registerApi;
