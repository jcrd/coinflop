import fs from "fs"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import * as csv from "csv"

dotenv.config()

const database = process.env.MONGO_DATABASE
const collection = process.env.MONGO_COLLECTION

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
  return r === "Bull" ? 1 : -1
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
  round: {
    stringify: csv.stringify({
      header: true,
      columns: [
        "epoch",
        "startTimestamp",
        "lockTimestamp",
        "closeTimestamp",
        "lockPrice",
        "closePrice",
        "result",
      ],
    }),
    stream: fs.createWriteStream(
      `data/mongodb_${database}_${collection}_round.csv`
    ),
    process: (entry) => {
      if (!("timestamp" in entry)) {
        return
      }
      return [
        entry.epoch,
        entry.timestamp.start,
        entry.timestamp.lock,
        entry.timestamp.close,
        entry.lockPrice,
        entry.closePrice,
        resultBinary(entry.result),
      ]
    },
  },
}

async function write() {
  await client
    .db(database)
    .collection(collection)
    .find()
    .forEach((entry) => {
      for (const f of Object.values(files)) {
        const p = f.process(entry)
        if (p !== undefined) {
          f.stringify.write(p)
        }
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

const client = new MongoClient(process.env.MONGO_URL)
await client.connect()

await write()

await client.close()
