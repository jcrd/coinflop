import { MongoClient } from "mongodb"

export default async function (uri, { database, collection }) {
  const client = new MongoClient(uri)
  await client.connect()

  return {
    name: "mongodb",
    signals: {
      Update: async (entry) =>
        await client.db(database).collection(collection).insertOne(entry),
    },
    load: async (limit = 50) => {
      return await client
        .db(database)
        .collection(collection)
        .find()
        .sort({ epoch: -1 })
        .limit(limit)
        .toArray()
    },
    close: async () => await client.close(),
  }
}
