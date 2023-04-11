import { MongoClient } from "mongodb"

export default async function (uri) {
  const client = new MongoClient(uri)
  await client.connect()

  return {
    name: "mongodb",
    signals: {
      Update: async (entry) =>
        await client.db("round").collection("history").insertOne(entry),
    },
    load: async (limit = 50) => {
      return await client
        .db("round")
        .collection("history")
        .find()
        .sort({ epoch: -1 })
        .limit(limit)
        .toArray()
    },
    close: async () => await client.close(),
  }
}
