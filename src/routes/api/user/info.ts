import express from 'express';
import { useApiHandler, useDbCrud } from '../../../hooks';
import { DbTable } from '../../../types';

const infoApi = express.Router();
const { read } = useDbCrud();

infoApi.get('/info', async (request, response) => {
  useApiHandler({
    response,
    required: {
      target: request.body,
      check: [{ type: 'String', fields: ['account', 'phoneNumber'] }],
    },
    middleware: [
      async () => {
        await read({
          table: DbTable.USER,
          response,
          request,
          filter: request.body,
        });
      },
    ],
  });
});

export default infoApi;
