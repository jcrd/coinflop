import fs from "fs"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import * as csv from "csv"

const database = "round"
const collection = "history"

const fullColumns = [
  "bbUpper",
  "bbMiddle",
  "bbLower",
  "stochRSIk",
  "stochRSId",
  "hma1",
  "hma3",
  "hma5",
  "result",
]

function resultBinary(r) {
  return r === "Bull" ? 1 : 0
}

const files = {
  full: {
    stringify: csv.stringify({ header: true, columns: fullColumns }),
    stream: fs.createWriteStream(`data/mongodb_${database}_${collection}.csv`),
    process: (entry) => {
      const bb = entry.criteria[1].bbands.values
      const stochRSI = entry.criteria[1].stochRSI.values
      return [
        bb.upper,
        bb.middle,
        bb.lower,
        stochRSI.k,
        stochRSI.d,
        entry.criteria[1].hma.values.hma,
        entry.criteria[3].hma.values.hma,
        entry.criteria[5].hma.values.hma,
        resultBinary(entry.result),
      ]
    },
  },
  epoch: {
    stringify: csv.stringify({ header: true, columns: ["epoch", "result"] }),
    stream: fs.createWriteStream(
      `data/mongodb_${database}_${collection}_epoch.csv`
    ),
    process: (entry) => [entry.epoch, resultBinary(entry.result)],
  },
}

async function write() {
  await client
    .db(database)
    .collection(collection)
    .find()
    .forEach((entry) => {
      for (const f of Object.values(files)) {
        f.stringify.write(f.process(entry))
      }
    })

  for (const f of Object.values(files)) {
    f.stringify.end()
    f.stringify.pipe(f.stream)
  }

  return new Promise((resolve) => {
    for (const f of Object.values(files)) {
      f.stream.once("finish", () => {
        resolve()
      })
    }
  })
}

dotenv.config()

const client = new MongoClient(process.env.MONGO_URL)
await client.connect()

await write()

await client.close()
