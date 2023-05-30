import { MongoClient, ServerApiVersion } from 'mongodb';
import { DbTables } from '../types';
import { DB_TABLE_NAME, MyMongoDbURI } from './uri';

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

function createDatabase(database: string, table: DbTables) {
  const db = runMongoClient(database);
  db.collection(table);
  return db;
}

export { DB_TABLE_NAME };
export default createDatabase;
