import { createRequire } from "module"
import { setTimeout } from "timers/promises"

import { ethers } from "ethers"
import dotenv from "dotenv"

const PANCAKESWAP_ADDR = "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA"
const PANCAKESWAP_ABI = createRequire(import.meta.url)("./abi/pancakeswap.json")

const BetType = {
  Bear: "Bear",
  Bull: "Bull",
}

const BET_WINDOW = {
  AFTER_ROUND_START: 264,
  BEFORE_ROUND_LOCK: 10,
}
const BET_AMOUNT = "0.1"

function getTimestamp() {
  return Math.floor(Date.now() / 1000)
}

function getBetType(bull, bear, ratio = 5) {
  if (
    (bear > 0 && bull > bear && bull / bear < ratio) ||
    (bull < bear && bear / bull > ratio)
  ) {
    return BetType.Bear
  }
  return BetType.Bull
}

async function placeBet(contract, epoch, type, amount) {
  console.log(`Round ${epoch}: Placing ${type} bet...`)
  try {
    // const tx = await contract["bet" + type](epoch, {
    //   value: ethers.parseEther(amount),
    // })
    // await tx.wait()
    console.log(`Round ${epoch}: ${type} bet placed (${amount})`)
    return true
  } catch (e) {
    console.log(`Round ${epoch}: Failed to place ${type} bet: {e}`)
    return false
  }
}

async function betHandler(
  contract,
  signerAddress,
  abortSignal,
  betAmount = BET_AMOUNT,
  betWindowOpen = BET_WINDOW.AFTER_ROUND_START,
  betWindowClose = BET_WINDOW.BEFORE_ROUND_LOCK
) {
  const epoch = await contract.currentEpoch()
  const round = await contract.rounds(epoch)
  let timestamp = getTimestamp()

  const roundTime = timestamp - Number(round.startTimestamp)

  const wait = async (seconds) => {
    try {
      // Convert to milliseconds.
      await setTimeout(seconds * 1000, null, {
        signal: abortSignal,
      })
    } catch (e) {
      if (e.name === "AbortError") {
        console.log("Aborted")
      } else {
        throw e
      }
    }
    return !abortSignal.aborted
  }

  const waitForRoundEnd = async (epoch, seconds) => {
    seconds += 6
    console.log(`Round ${epoch}: Waiting ${seconds}s for round to end...`)
    return await wait(seconds)
  }

  if (roundTime < betWindowOpen) {
    const waitSeconds = betWindowOpen - roundTime
    console.log(
      `Round ${epoch}: Waiting ${waitSeconds}s for betting window to open...`
    )
    if (!(await wait(waitSeconds))) {
      return false
    }
    timestamp = getTimestamp()
  }

  const roundLockTime = Number(round.lockTimestamp) - timestamp

  if (roundLockTime < betWindowClose) {
    console.log(`Round ${epoch}: Betting window is already closed`)
    return await waitForRoundEnd(epoch, roundLockTime)
  }

  let currentBet

  try {
    const ledger = await contract.ledger(epoch, signerAddress)
    currentBet = ledger.amount
  } catch (e) {
    console.log(`Round ${epoch}: Failed to get ledger data: ${e}`)
    return false
  }

  if (currentBet > 0) {
    console.log(`Round ${epoch}: A bet has already been placed`)
    return await waitForRoundEnd(epoch, roundLockTime)
  }

  // Get up-to-date round data.
  const { bullAmount, bearAmount } = await contract.rounds(epoch)

  console.log(
    `Round ${epoch}: Preparing to bet (bull ${bullAmount}, bear ${bearAmount})`
  )

  if (
    await placeBet(
      contract,
      epoch,
      getBetType(bullAmount, bearAmount),
      betAmount
    )
  ) {
    return await waitForRoundEnd(epoch, roundLockTime)
  } else {
    return false
  }
}

dotenv.config()

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_ENDPOINT)
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY)
const signer = wallet.connect(provider)
const contract = new ethers.Contract(PANCAKESWAP_ADDR, PANCAKESWAP_ABI, signer)

const controller = new AbortController()
let running = true

process.on("SIGINT", () => {
  console.log("Received SIGINT")
  controller.abort()
  running = false
})

console.log("Running...")

while (running) {
  if (!(await betHandler(contract, signer.address, controller.signal))) {
    break
  }
}
