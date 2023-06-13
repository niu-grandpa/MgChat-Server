import express from 'express';
import { useDbCrud } from '../../../hooks';
import { ClientQueryFields, DbTable, ResponseCode } from '../../../types';
import { wrapperResult } from '../../../utils';

const infoApi = express.Router();
const { read } = useDbCrud();

infoApi.get('/info', async (request, response) => {
  const { uid, phoneNumber } = request.query as unknown as ClientQueryFields;
  const data = await read({
    table: DbTable.USER,
    filter: uid ? { uid } : { phoneNumber },
  });
  response.send(wrapperResult(data, ResponseCode.SUCCESS));
});

export default infoApi;
