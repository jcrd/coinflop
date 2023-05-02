import dotenv from "dotenv"
import { MongoClient } from "mongodb"

async function init() {
  dotenv.config()

  const database = process.env.MONGO_DATABASE
  const collection = process.env.MONGO_COLLECTION

  const client = new MongoClient(process.env.MONGO_URL)
  await client.connect()
  const coll = client.db(database).collection(collection)

  return coll
}

export const migrate = async () => {
  const coll = await init()
  await coll.find().forEach(async (entry) => {
    await coll.updateOne(
      { epoch: entry.epoch },
      {
        $set: {
          epoch: Number(entry.epoch),
        },
      }
    )
  })
}

export const rollback = async () => {}

export const tags = []
