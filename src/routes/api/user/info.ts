import express from 'express';
import { useDbCrud } from '../../../hooks';
import {
  ClientQueryFields,
  CollectionName,
  ResponseCode,
} from '../../../types';
import { wrapperResult } from '../../../utils';

const infoApi = express.Router();
const { read } = useDbCrud();

infoApi.get('/info', async (request, response) => {
  const { uid, phoneNumber } = request.query as unknown as ClientQueryFields;
  const data = await read({
    table: CollectionName.USERS,
    filter: uid ? { uid } : { phoneNumber },
  });
  response.send(wrapperResult(data, ResponseCode.SUCCESS));
});

export default infoApi;
