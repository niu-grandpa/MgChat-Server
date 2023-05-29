import { MongoClient, ServerApiVersion } from 'mongodb';
import { DbTables } from '../types';
import MyMongoDbURI from './uri';

/**用于选取数据库表的key值 */
export const DB_TABLE_KEY = 'admin';

function runMongoClient(name: string) {
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(MyMongoDbURI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  console.log(`[Mongo] ${name} db running at ${MyMongoDbURI}`);
  return client.db(name);
}

function createDatabase(database: string, tables: DbTables) {
  const db = runMongoClient(database);
  db.collection(tables);
  return db;
}

export default createDatabase;
