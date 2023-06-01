import express from 'express';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { ClientQueryFields, DbTable, ResponseCode } from '../../../types';
import { endcodePhoneToken, wrapperResult } from '../../../utils';

const forgetPwApi = express.Router();
const { read, update } = useDbCrud();

forgetPwApi.post('/forget', (request, response) => {
  const fields = ['phoneToken', 'password'];
  const { code, password, phoneToken } = request.body as ClientQueryFields;
  const common = {
    table: DbTable.USER,
    filter: { phoneNumber: endcodePhoneToken(phoneToken, code) },
  };
  useApiHandler({
    response,
    required: {
      target: request.body,
      must: fields,
      check: [
        {
          type: 'String',
          fields: fields,
        },
      ],
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
          update: { $set: { code, password } },
        });
      },
    ],
  });
});

export { forgetPwApi };
