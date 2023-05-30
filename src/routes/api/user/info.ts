import express from 'express';
import { crudHandler } from '.';
import { useRead } from '../../../hooks';
import { ClientQueryFields } from '../../../types';
import { logoutFields } from '../../fields';

const infoApi = express.Router();

infoApi.get('/info', async (req, res) =>
  crudHandler({
    req,
    res,
    fields: logoutFields,
    next: async () => {
      const { id, account, phoneNumber } = req.body as ClientQueryFields;
      const filter = {};

      if (id !== undefined) {
        filter['id'] = id;
      } else if (account !== undefined) {
        filter['account'] = account;
      } else {
        filter['phoneNumber'] = phoneNumber;
      }

      await useRead({ req, res, filter });
    },
  })
);

export { infoApi };
