import { db } from '../app';
import { DB_TABLE_KEY } from '../mongodb';
import { DbTableSructure } from '../types';

/**
 * 通过经典表id自增算法，生成用户账号
 */
export async function useGenerateUid() {
  const table = db.collection('data');
  const { allAccount } = (await table.findOne({
    allAccount: { $exists: true },
  })) as unknown as DbTableSructure;
  // 取末尾id自增
  const newUid = (Number(allAccount[allAccount.length - 1]) + 1).toString();
  await table.updateOne(
    { key: DB_TABLE_KEY },
    { $push: { allAccount: newUid } }
  );
  return newUid;
}
