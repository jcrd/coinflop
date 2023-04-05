import { Worker } from "worker_threads"

import dotenv from "dotenv"

import Contract from "./lib/contract.js"
import Loop from "./lib/loop.js"
import { Logger, HistoryLogger } from "./lib/logger.js"
import History from "./lib/history.js"
import runServer from "./lib/server.js"

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

process.on("SIGINT", () => {
  console.log("Received SIGINT")
  loop.abort()
})

let frontend
if (process.env.WITH_FRONTEND) {
  frontend = new Worker("./frontend.js")
  frontend.on("error", (e) => {
    console.log(`frontend error: ${e}`)
  })
}

console.log("Running...")

const stopServer = runServer(loop, history)
await history.load()
await loop.run(BET_WINDOW.AFTER_ROUND_START, BET_WINDOW.BEFORE_ROUND_LOCK)
stopServer()

if (frontend) {
  frontend.postMessage({ exit: true })
}
