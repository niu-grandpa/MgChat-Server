import express from 'express';
import { crudHandler } from '.';
import { useRead } from '../../hooks';
import { DbTableSructure } from '../../types';
import { wrapperResult } from '../../utils';
import { loginFields } from '../fields';

const loginApi = express.Router();

loginApi.post('/login', async (req, res) => {
  crudHandler({
    req,
    res,
    fields: loginFields.upw,
    next: async () => {
      const data = await useRead({
        req,
        res,
        noSend: true,
      });
      // 判断用户是否存在
      if (data === null) {
        res.send(wrapperResult(data, ''));
      } else {
        const { allUsers } = data as unknown as DbTableSructure;

        // todo与客户端建立tcp连接, websocket

        res.send(wrapperResult(allUsers[0], 'success'));
      }
    },
  });
});

export { loginApi };
