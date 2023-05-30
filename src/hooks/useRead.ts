import { db } from '../app';
import { DB_TABLE_NAME } from '../mongodb';
import { ClientQueryFields, ResponseCode } from '../types';
import { wrapperResult } from '../utils';
import { CrudOptions } from './types';

/**
 * 读取数据库数据操作，限定Get请求且客户端通过body传输数据
 */
export async function useRead({
  req,
  res,
  filter,
  tableProps,
  noSend,
}: CrudOptions) {
  const params = req.body as ClientQueryFields;
  const doc = {};
  doc[tableProps!] = params;

  const data = await db
    .collection('data')
    .findOne({ key: DB_TABLE_NAME }, filter || doc);

  if (noSend) return data;

  res.status(200);

  if (data === null) {
    res.send(wrapperResult(data, ResponseCode.NONE));
  } else {
    res.send(wrapperResult(data, ResponseCode.SUCCESS));
  }
}
