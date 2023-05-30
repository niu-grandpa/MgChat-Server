import express from 'express';
import { crudHandler } from '.';
import { useRead, useUpdate } from '../../../hooks';
import { forgetFields } from '../../../routes/fields';
import {
  ClientQueryFields,
  DbTableSructure,
  ResponseCode,
} from '../../../types';
import { endcodePhoneToken, wrapperResult } from '../../../utils';

const forgetPwApi = express.Router();

forgetPwApi.post('/forget', (req, res) => {
  crudHandler({
    req,
    res,
    fields: forgetFields,
    next: async () => {
      const { phoneToken, code, password } = req.body as ClientQueryFields;
      const phoneNumber = endcodePhoneToken(phoneToken, code.toString());
      const data = await useRead({
        req,
        res,
        tableProps: 'allUsers',
        filter: { phoneNumber },
        noSend: true,
      });
      const { allUsers } = data as unknown as DbTableSructure;
      if (allUsers === null) {
        res.send(wrapperResult(null, ResponseCode.NONE));
        return;
      }
      await useUpdate({
        req,
        res,
        tableProps: 'allUsers',
        filter: { phoneNumber },
        newData: { password },
      });
    },
  });
});

export { forgetPwApi };
