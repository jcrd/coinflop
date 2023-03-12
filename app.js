import { createRequire } from "module"

import { ethers } from "ethers"
import dotenv from "dotenv"

import Loop from "./lib/loop.js"
import logger from "./lib/logger.js"
import history from "./lib/history.js"

import strategies from "./lib/strategies/index.js"

const PANCAKESWAP_ADDR = "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA"
const PANCAKESWAP_ABI = createRequire(import.meta.url)("./abi/pancakeswap.json")

const BET_WINDOW = {
  AFTER_ROUND_START: 264,
  BEFORE_ROUND_LOCK: 10,
}
const BET_AMOUNT = "0.1"

function getStrategy() {
  const arg = process.argv[2]
  return strategies[arg] || strategies["consensus"]
}

dotenv.config()

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_ENDPOINT)
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY)
const signer = wallet.connect(provider)
const contract = new ethers.Contract(PANCAKESWAP_ADDR, PANCAKESWAP_ABI, signer)

const loop = Loop(contract, signer)
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
