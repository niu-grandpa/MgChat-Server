import { ObjectId } from 'mongodb';
import { db } from '../app';
import { DB_TABLE_NAME } from '../mongodb';
import { wrapperResult } from '../utils';
import { CrudOptions } from './types';
import { useRead } from './useRead';

/**
 * 创建数据库表数据，用于POST操作，一般不返回数据只返回调用状态
 */
export async function useCreate({ req, res, tableProps }: CrudOptions) {
  const params = req.body;
  const data = await useRead({ req, res, tableProps, noSend: true });
  if (data !== null) {
    res.send(wrapperResult(null, 'existed'));
  } else {
    const doc = {};
    doc[tableProps!] = {
      id: new ObjectId().toJSON(),
      ...params,
      createTime: Date.now(),
    };
    await db
      .collection('data')
      .updateOne({ key: DB_TABLE_NAME }, { $push: doc });
    res.send(wrapperResult());
  }
}
