import express from 'express';
import { crudHandler } from '.';
import { settlementUserLevelAndCredit } from '../../../core';
import { useRead, useUpdate } from '../../../hooks';
import {
  ClientQueryFields,
  DbTableSructure,
  ResponseCode,
  UserStatus,
} from '../../../types';
import { wrapperResult } from '../../../utils';
import { logoutFields } from '../../fields';

const logoutApi = express.Router();

logoutApi.post('/logout', async (req, res) => {
  crudHandler({
    req,
    res,
    fields: logoutFields,
    next: async () => {
      const { id, logoutTime } = req.body as ClientQueryFields;

      const { allUsers } = (await useRead({
        req,
        res,
        filter: { id },
        noSend: true,
        tableProps: 'allUsers',
      })) as unknown as DbTableSructure;

      let user = allUsers[0];
      user = settlementUserLevelAndCredit({ ...user, logoutTime });
      user.loginTime = 0;
      user.status = UserStatus.OFFLINE;

      await useUpdate({
        req,
        res,
        filter: { id },
        noSend: true,
        tableProps: 'allUsers',
        newData: {
          'allUsers.$': user,
        },
      });

      // todo 断开tcp连接
      res.send(wrapperResult(null, ResponseCode.SUCCESS));
    },
  });
});

export { logoutApi };
