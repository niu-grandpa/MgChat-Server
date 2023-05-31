import express from 'express';
import { db } from '../../../app';
import { useApiHandler, useDbCrud, useGenerateUid } from '../../../hooks';
import { DbTable, UserGender, UserStatus } from '../../../types';

const registerApi = express.Router();

const { create } = useDbCrud();

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
  useApiHandler({
    response,
    required: {
      target: request.body,
      check: [
        {
          type: 'String',
          fields: ['nickname', 'phoneNumber', 'code', 'password'],
        },
      ],
    },
    middleware: [
      async () => {
        await create({
          table: DbTable.USER,
          request,
          response,
          filter: { phoneNumber: request.body.phoneNumber },
          newData: {
            ...initUserData(),
            ...request.body,
            account: await useGenerateUid(db),
          },
        });
      },
    ],
  });
});

export { registerApi };
