import { MongoClient, ServerApiVersion } from 'mongodb';
import pkg from '../../package.json';
import { DbTables } from '../types';

const { Mongo } = pkg.env;
const URI = Mongo.SERVER_URL;
/**用于选取数据库表的key值 */
export const DB_TABLE_KEY = 'admin';

function runMongoClient(name: string) {
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  console.log(`[Mongo] ${name} db running at ${URI}`);
  return client.db(name);
}

function createDatabase(database: string, tables: DbTables) {
  const db = runMongoClient(database);
  db.collection(tables);
  return db;
}

export default createDatabase;
