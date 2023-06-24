import express from 'express';
import { useApiHandler, useDbCrud } from '../../../hooks';
import {
  ClientQueryFields,
  CollectionName,
  ResponseCode,
} from '../../../types';
import { jwtToken, wrapperResult } from '../../../utils';

const forgetPwApi = express.Router();
const { read, update } = useDbCrud();

forgetPwApi.post('/forget', (request, response) => {
  const fields = ['phoneNumber', 'password', 'code'];

  const { code, password, phoneNumber } = request.body
    .data as ClientQueryFields;

  const common = {
    table: CollectionName.USERS,
    filter: { phoneNumber },
  };

  useApiHandler({
    response,
    verifyCaptcha: { phoneNumber, code },
    required: {
      target: request.body.data,
      must: fields,
      check: [{ type: 'String', fields: fields }],
    },
    middleware: [
      async () => {
        if ((await read(common)) === null) {
          response.send(wrapperResult(null, ResponseCode.NO_ACCOUNT));
          return false;
        }
      },
      async () => {
        await update({
          ...common,
          response,
          update: {
            $set: {
              code,
              password,
              token: jwtToken().set({ phoneNumber, password, code }),
            },
          },
        });
      },
    ],
  });
});

export default forgetPwApi;
