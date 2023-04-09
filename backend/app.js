import dotenv from "dotenv"
import express from "express"

import Contract from "./lib/contract.js"
import Loop from "./lib/loop.js"
import { Logger, HistoryLogger } from "./lib/logger.js"
import History from "./lib/history.js"
import runWSServer from "./lib/wss.js"

import strategies from "./lib/strategies/index.js"

const BET_WINDOW = {
  AFTER_ROUND_START: 264,
  BEFORE_ROUND_LOCK: 10,
}
const BET_AMOUNT = "0.1"

dotenv.config()

function getStrategy() {
  const arg = process.argv[2]
  return strategies[arg] || strategies["ta_simple"]
}

const { contract, signerAddress } = Contract(
  process.env.PROVIDER_ENDPOINT,
  process.env.WALLET_PRIVATE_KEY
)

const history = new History("db/history")
history.addObserver(HistoryLogger())

const loop = new Loop(contract, signerAddress)
loop.addObserver(history.observer())
loop.addObserver(Logger())

const strategy = getStrategy()
loop.useStrategy(new strategy(BET_AMOUNT))

const app = express()

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

process.on("SIGINT", () => {
  console.log("Received SIGINT")
  loop.abort()
  httpServer.close()
})

const wsServer = runWSServer(loop, history)
httpServer.on("upgrade", wsServer.upgrade)

await history.load()
await loop.run(BET_WINDOW.AFTER_ROUND_START, BET_WINDOW.BEFORE_ROUND_LOCK)

wsServer.stop()
