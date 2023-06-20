import { MongoClient, ServerApiVersion } from 'mongodb';
import { DB_TABLE_NAME, MyMongoDbURI, initUId } from '../private';
import { DbTable } from '../types';

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
  const db = runMongoClient(DB_TABLE_NAME);

  // 初始化account表的数据
  const account = db.collection(DbTable.ACCOUNT);
  account.findOne({ uid: { $exists: true } }).then(res => {
    if (res === null) {
      account.insertOne({ key: 'allUid', uid: [initUId] });
    }
  });

  // 创建验证码集合，具有TTL索引，「createdAt」字段设置为文档的过期时间（秒）。
  // 新文档将在5分钟后从集合中删除。
  db.collection(DbTable.CAPTCHAS).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 5 }
  );

  // 初始化消息数据保存30天后自动删除
  db.collection(DbTable.MESSAGE).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 2592000 }
  );

  return db;
}

const db = createDatabase();

export { DB_TABLE_NAME };
export default db;
