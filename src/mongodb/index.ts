import { DbTables } from '@/types';
import { MongoClient, ServerApiVersion } from 'mongodb';
import pkg from '../../package.json';

const { Mongo } = pkg.env;
const URI = Mongo.LOCAL_URI;

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

function createDatabase(database: string, tables: DbTables[]) {
  const db = runMongoClient(database);
  for (const name of tables) {
    db.collection(name);
  }
  return db;
}

export default createDatabase;
