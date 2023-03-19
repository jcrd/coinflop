import dotenv from "dotenv"

import Contract from "./lib/contract.js"
import Loop from "./lib/loop.js"
import logger from "./lib/logger.js"
import history from "./lib/history.js"

import strategies from "./lib/strategies/index.js"

const BET_WINDOW = {
  AFTER_ROUND_START: 264,
  BEFORE_ROUND_LOCK: 10,
}
const BET_AMOUNT = "0.1"

dotenv.config()

function getStrategy() {
  const arg = process.argv[2]
  return strategies[arg] || strategies["consensus"]
}

const { contract, signerAddress } = Contract(
  process.env.PROVIDER_ENDPOINT,
  process.env.WALLET_PRIVATE_KEY
)

const loop = Loop(contract, signerAddress)
loop.addObserver(history)
loop.addObserver(logger)

process.on("SIGINT", () => {
  console.log("Received SIGINT")
  loop.abort()
})

const strategy = getStrategy()
loop.useStrategy(new strategy(BET_AMOUNT))

console.log("Running...")
await loop.run(BET_WINDOW.AFTER_ROUND_START, BET_WINDOW.BEFORE_ROUND_LOCK)
