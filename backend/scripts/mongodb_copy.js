import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

if (process.env.DEST_MONGO_URL === undefined) {
  console.log("DEST_MONGO_URL undefined")
  process.exit(1)
}

const srcClient = new MongoClient(process.env.MONGO_URL)
await srcClient.connect()

const destClient = new MongoClient(process.env.DEST_MONGO_URL)
await destClient.connect()

process.on("SIGINT", async () => {
  await destClient.close()
  await srcClient.close()
  process.exit(0)
})

srcClient
  .db("round")
  .collection("history")
  .find()
  .forEach((entry) =>
    destClient.db("round").collection("history").insertOne(entry)
  )
