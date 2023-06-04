import express from 'express';
import { useDbCrud } from '../../../hooks';
import { DbTable, ResponseCode } from '../../../types';
import { wrapperResult } from '../../../utils';

const infoApi = express.Router();
const { read } = useDbCrud();

infoApi.get('/info', async (request, response) => {
  const data = await read({
    table: DbTable.USER,
    filter: { uid: request.body.uid },
  });
  response.send(wrapperResult(data, ResponseCode.SUCCESS));
});

export default infoApi;
