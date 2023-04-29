import dotenv from "dotenv"
import express from "express"

import Contract from "./lib/contract.js"
import Loop from "./lib/loop.js"
import { Logger, HistoryLogger } from "./lib/logger.js"
import History from "./lib/history.js"
import runWSServer from "./lib/wss.js"
import LevelDB from "./lib/db/level.js"
import MongoDB from "./lib/db/mongo.js"

import strategyEngine from "./lib/engine.js"

const BET_WINDOW = {
  AFTER_ROUND_START: 264,
  BEFORE_ROUND_LOCK: 10,
}

const { contract, signerAddress } = Contract(
  process.env.PROVIDER_ENDPOINT,
  process.env.WALLET_PRIVATE_KEY
)

const history = new History()
history.addObserver(HistoryLogger())

const loop = new Loop(contract, signerAddress)
loop.addObserver(history.observer())
loop.addObserver(Logger())

const wsServer = runWSServer(loop, history)
const app = express()

let db

switch (process.env.DATABASE) {
  case "mongo":
    console.log("Using mongodb")
    db = await MongoDB(process.env.MONGO_URL, {
      database: process.env.MONGO_DATABASE,
      collection: process.env.MONGO_COLLECTION,
    })
    break
  default:
    console.log("Using leveldb")
    db = LevelDB("db/history")
}

history.addObserver(db)

app.get("/status", (_, res) => {
  res.send("OK")
})

if (process.env.WITH_FRONTEND) {
  app.use(express.static("frontend"))

  app.get("/", function (_, res) {
    res.sendFile(path.join("frontend", "index.html"))
  })
}

console.log("Running...")

const httpServer = app.listen(process.env.PORT || 8000, () => {
  console.log(`Running server on port: ${httpServer.address().port}`)
})

httpServer.on("upgrade", wsServer.upgrade)

process.on("SIGINT", async () => {
  console.log("Received SIGINT")
  strategyEngine.stop()
  loop.abort()
  await db.close()
  wsServer.close()
  httpServer.close((err) => {
    process.exit(err ? 1 : 0)
  })
})

// Called last so signal data is queued by websocket server.
strategyEngine.run(contract, loop, history)
history.load(await db.load())

await loop.run(BET_WINDOW.AFTER_ROUND_START, BET_WINDOW.BEFORE_ROUND_LOCK)
