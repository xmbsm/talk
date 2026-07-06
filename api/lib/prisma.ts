import { MongoClient, type Db } from 'mongodb'

const globalForMongo = globalThis as unknown as { client: MongoClient; db: Db }

export let db: Db

async function connect(): Promise<void> {
  if (globalForMongo.db) {
    db = globalForMongo.db
    return
  }

  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/talk'
  const client = new MongoClient(uri)
  
  await client.connect()
  globalForMongo.client = client
  globalForMongo.db = client.db()
  db = globalForMongo.db
}

await connect()

export default db