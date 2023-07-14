import express from 'express';
import { useDbCrud } from '../../../hooks';
import { ClientQueryFields, CollectionName } from '../../../types';

const infoApi = express.Router();
const { read } = useDbCrud();

infoApi.get('/info', async (request, response) => {
  const { uid, phoneNumber } = request.query as unknown as ClientQueryFields;
  await read({
    table: CollectionName.USERS,
    filter: { $or: [{ uid }, { phoneNumber }] },
    response,
  });
});

export default infoApi;
