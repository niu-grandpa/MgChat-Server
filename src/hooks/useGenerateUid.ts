import db from '../mongodb';
import { DbAccount, DbTable } from '../types';

/**
 * 经典表id自增算法，生成用户账号
 */
export async function useGenerateUid(): Promise<string> {
  const uidTable = db.collection(DbTable.ACCOUNT);
  const { uid } = (await uidTable.findOne({})) as DbAccount;
  const newUid = (Number(uid[uid.length - 1]) + 1).toString();
  await uidTable.updateOne({ key: 'allUids' }, { $push: { uid: newUid } });
  return newUid;
}
