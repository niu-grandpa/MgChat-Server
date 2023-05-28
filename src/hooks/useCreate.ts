import { db } from '../app';
import { ClientQueryFields } from '../types';
import { wrapperResult } from '../utils';
import { CrudOptions } from './types';
import { useRead } from './useRead';

/**
 * 创建数据库表数据，用于POST操作，一般不返回数据只返回调用状态
 */
export async function useCreate({ req, res, table }: CrudOptions) {
  const params = req.body as ClientQueryFields;
  const data = await useRead({ req, res, table, noSend: true });
  if (data !== null) {
    res.send(wrapperResult(null, 'existed'));
  } else {
    await db.collection(table).insertMany([params]);
    res.send(wrapperResult());
  }
}
