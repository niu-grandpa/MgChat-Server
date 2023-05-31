import { Db } from 'mongodb';
import { DbAccount, DbTable } from '../types';

/**
 * 经典表id自增算法，生成用户账号
 */
export async function useGenerateUid(db: Db): Promise<string> {
  const accountTable = db.collection(DbTable.ACCOUNT);
  const { uid } = (await accountTable.findOne({})) as DbAccount;
  const newUid = (Number(uid[uid.length - 1]) + 1).toString();
  await accountTable.updateOne({ key: 'allUids' }, { $push: { uid: newUid } });
  return newUid;
}
