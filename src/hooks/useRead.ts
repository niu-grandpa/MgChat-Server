import { db } from '../app';
import { ClientQueryFields } from '../types';
import { wrapperResult } from '../utils';
import { CrudOptions } from './types';

/**
 * 读取数据库数据操作，限定Get请求且客户端通过body传输数据
 */
export async function useRead({ req, res, table }: CrudOptions) {
  const params = req.body as ClientQueryFields;
  const data = await db.collection(table).findOne(params);
  res.header('Content-Type', 'application/json');
  res.status(200);
  // @ts-ignore
  res.send(wrapperResult(data));
}
