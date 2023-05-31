import express from 'express';
import { db } from '../../../app';
import { useApiHandler, useGenerateUid } from '../../../hooks';
import { DbUser, UserGender, UserStatus } from '../../../types';

const registerApi = express.Router();

const initUserData = () =>
  ({
    icon: '',
    city: '',
    age: 0,
    status: UserStatus.OFFLINE,
    level: 0,
    gender: UserGender.NONE,
    credit: 0,
    loginTime: 0,
    privilege: 0,
    upgradeDays: 0,
    nickname: '',
    account: '',
    password: '',
    phoneNumber: '',
    friends: [],
    groups: [],
    activeTime: 0,
    createTime: 0,
  } as DbUser.UserInfo);

registerApi.post('/register', (req, res) => {
  useApiHandler({
    response: res,
    required: {
      target: req.body,
      check: [
        {
          type: 'String',
          fields: ['nickname', 'phoneNumber', 'code', 'password'],
        },
      ],
    },
    middleware: [
      async () => {
        const key = await useGenerateUid(db);
        res.send(key);
      },
    ],
  });
});

export { registerApi };
