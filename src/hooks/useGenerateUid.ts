import db from '../mongodb';
import { CollectionName, UuidCollection } from '../types';

/**
 * 经典表id自增算法，生成用户账号
 */
export async function useGenerateUid(): Promise<string> {
  const collect = db.collection(CollectionName.UUID);
  const list = (await collect.find({}).toArray()) as UuidCollection[];
  const uid = (list[list.length - 1].uid + 1).toString();
  await collect.insertOne({ uid, createTime: Date.now() });
  return uid;
}
