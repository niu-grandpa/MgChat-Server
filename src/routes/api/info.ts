import express from 'express';
import { crudHandler } from '..';
import { useRead } from '../../hooks';

const infoApi = express.Router();

infoApi.get('/info', async (req, res) =>
  crudHandler({
    req,
    res,
    fields: ['account'],
    next: () => useRead({ req, res }),
  })
);

export { infoApi };
