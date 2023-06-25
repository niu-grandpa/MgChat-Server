import dayjs from 'dayjs';
import express from 'express';
import { useApiHandler, useDbCrud, useGenerateUid } from '../../../hooks';
import {
  CollectionName,
  ResponseCode,
  UserGender,
  UserStatus,
} from '../../../types';
import { signData, wrapperResult } from '../../../utils';

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
  level: 1,
  gender: UserGender.NONE,
  credit: 200,
  privilege: 0,
  upgradeDays: 0,
  timeInfo: {
    loginTime: 0,
    logoutTime: 0,
    activeTime: 0,
    expiredTime: 0,
    lastActiveTime: 0,
    createTime: Date.now(),
  },
});

registerApi.post('/register', (request, response) => {
  const { phoneNumber, code, password, ...rest } = request.body.data;
  const fields = ['nickname', 'phoneNumber', 'code', 'password'];
  let uid = '';

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
        const data = await read({
          table: CollectionName.USERS,
          filter: { phoneNumber },
        });
        if (data !== null) {
          response.send(wrapperResult(null, ResponseCode.EXISTED));
          return false;
        }
      },
      async () => {
        uid = await useGenerateUid();
      },
      async () => {
        const token = signData(
          { phoneNumber, password, code },
          undefined,
          dayjs().add(1, 'month').valueOf()
        );
        await create({
          table: CollectionName.USERS,
          request,
          response,
          newData: {
            uid,
            password,
            phoneNumber,
            token,
            ...initUserData(),
            ...rest,
          },
        });
      },
    ],
  });
});

export default registerApi;
