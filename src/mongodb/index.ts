import { MongoClient, ServerApiVersion } from 'mongodb';
import { DbName, MyMongoDbURI, initUId } from '../private';
import { CollectionName } from '../types';

function runMongoClient(name: string) {
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(MyMongoDbURI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  console.log(`Mongodb connecting to ${MyMongoDbURI}`);
  return client.db(name);
}

function createDatabase() {
  const db = runMongoClient(DbName);

  // 初始化uuid表的数据
  const uuid = db.collection(CollectionName.UUID);
  uuid.findOne({ uid: { $exists: true } }).then(res => {
    if (res === null) {
      uuid.insertOne({ uid: initUId, createTime: Date.now() });
    }
  });

  // 创建验证码集合，具有TTL索引，「createdAt」字段设置为文档的过期时间（秒）。
  // 新文档将在5分钟后从集合中删除。
  db.collection(CollectionName.CAPTCHAS).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 5 }
  );

  // 用户发起的好友申请3天有效
  db.collection(CollectionName.USER_APPLICATION).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 259200 }
  );

  return db;
}

const db = createDatabase();

export { DbName };
export default db;
