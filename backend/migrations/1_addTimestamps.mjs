import dotenv from "dotenv"
import { MongoClient } from "mongodb"

import Contract from "../src/lib/contract.js"

async function init() {
  dotenv.config()

  const database = process.env.MONGO_DATABASE
  const collection = process.env.MONGO_COLLECTION

  const client = new MongoClient(process.env.MONGO_URL)
  await client.connect()
  const coll = client.db(database).collection(collection)

  const { contract } = Contract(
    process.env.PROVIDER_ENDPOINT,
    process.env.WALLET_PRIVATE_KEY
  )

  return [coll, contract]
}

export const migrate = async () => {
  const [coll, contract] = await init()
  await coll.find().forEach(async (entry) => {
    const r = await contract.rounds(entry.epoch)
    await coll.updateOne(
      { epoch: entry.epoch },
      {
        $set: {
          timestamp: {
            start: Number(r.startTimestamp),
            lock: Number(r.lockTimestamp),
            close: Number(r.closeTimestamp),
          },
        },
      }
    )
  })
}

export const rollback = async () => {
  const [coll] = await init()
  await coll.find().forEach(async (entry) => {
    await coll.updateOne({ epoch: entry.epoch }, { $unset: "timestamp" })
  })
}

export const tags = []
