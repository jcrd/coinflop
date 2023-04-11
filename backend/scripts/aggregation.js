import dotenv from "dotenv"
import { MongoClient } from "mongodb"

import { Direction } from "../src/lib/enums.js"

const functions = {
  bad_predictions: async () => {
    const data = {
      rounds: 0,
      1: { bbands: 0, stochRSI: 0, hma: 0 },
      3: { hma: 0 },
      5: { hma: 0 },
    }

    await client
      .db("round")
      .collection("history")
      .find()
      .forEach((entry) => {
        data.rounds++
        if (entry.direction !== Direction.Skip) {
          return
        }
        const state = entry.result === Direction.Bull ? "up" : "down"
        for (const [i, intervalData] of Object.entries(entry.criteria)) {
          for (const [name, criterionData] of Object.entries(intervalData)) {
            if (!criterionData.state[state]) {
              data[i][name]++
            }
          }
        }
      })

    return data
  },
}

dotenv.config()

const client = new MongoClient(process.env.MONGO_URL)
await client.connect()

const arg = process.argv[2] || "bad_predictions"

if (arg in functions) {
  console.log(arg, await functions[arg]())
} else {
  console.log(`Bad argument: ${arg}`)
}

await client.close()
