import { db } from '../app';
import { DB_TABLE_NAME } from '../mongodb';
import { wrapperResult } from '../utils';
import { CrudOptions } from './types';

/**
 * 数据库更新操作
 */
export async function useUpdate({
  res,
  filter,
  newData,
  noSend,
  tableProps,
}: CrudOptions) {
  const doc = {};
  doc[tableProps!] = { $elemMatch: filter };
  await db.collection('data').updateOne(
    {
      key: DB_TABLE_NAME,
      ...doc,
    },
    { $set: newData }
  );
  if (!noSend) {
    res.status(200);
    res.send(wrapperResult(null, 'success'));
  }
}

// useUpdate({data: {count: 1}})
