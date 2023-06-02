import { MongoClient, ServerApiVersion } from 'mongodb';
import { DB_TABLE_NAME, MyMongoDbURI, adminPwd, initUId } from './private';

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
  const db = runMongoClient('MgChat');

  // 初始化account表的数据
  const account = db.collection('account');
  account.findOne({ uid: { $exists: true } }).then(res => {
    if (res === null) {
      account.insertOne({ key: 'allUid', uid: [initUId] });
    }
  });

  // 初始化user表数据
  const user = db.collection('user');
  user.findOne({ account: initUId }).then(res => {
    if (res === null) {
      user.insertOne({
        account: initUId,
        password: adminPwd,
        level: 12,
        gender: 0,
        friends: [],
        groups: [],
      });
    }
  });

  return db;
}

const db = createDatabase();

export { DB_TABLE_NAME };
export default db;
