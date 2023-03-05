import { EventEmitter } from "events"
import { setTimeout } from "timers/promises"

import Signals from "./signals.js"

function getTimestamp() {
  return Math.floor(Date.now() / 1000)
}

export default function (contract, signer) {
  const emitter = new EventEmitter()
  const controller = new AbortController()
  let running = true
  let strategy

  async function wait(seconds) {
    try {
      // Convert to milliseconds.
      await setTimeout(seconds * 1000, null, {
        signal: controller.signal,
      })
    } catch (e) {
      if (e.name === "AbortError") {
        console.log("Aborted")
      } else {
        throw e
      }
    }
    return !controller.signal.aborted
  }

  async function waitForRoundEnd(epoch, seconds) {
    seconds += 6
    console.log(`Round ${epoch}: Waiting ${seconds}s for round to end...`)
    const r = await wait(seconds)
    emitter.emit(Signals.End, epoch)
    return r
  }

  async function emitSignals(betWindowOpen, betWindowClose) {
    const epoch = await contract.currentEpoch()
    let round = await contract.rounds(epoch)
    let timestamp = getTimestamp()

    const roundTime = timestamp - Number(round.startTimestamp)

    emitter.emit(Signals.Start, epoch)

    if (roundTime < betWindowOpen) {
      const waitSeconds = betWindowOpen - roundTime
      console.log(
        `Round ${epoch}: Waiting ${waitSeconds}s for betting window to open...`
      )
      emitter.emit(Signals.Early, epoch)
      if (!(await wait(waitSeconds))) {
        return false
      }
      timestamp = getTimestamp()
    }

    const roundLockTime = Number(round.lockTimestamp) - timestamp

    if (roundLockTime < betWindowClose) {
      console.log(`Round ${epoch}: Betting window is already closed`)
      emitter.emit(Signals.Late, epoch)
      return await waitForRoundEnd(epoch, roundLockTime)
    }

    let currentBet

    try {
      const ledger = await contract.ledger(epoch, signer.address)
      currentBet = ledger.amount
    } catch (e) {
      console.log(`Round ${epoch}: Failed to get ledger data: ${e}`)
      return false
    }

    if (currentBet > 0) {
      console.log(`Round ${epoch}: A bet has already been placed`)
      emitter.emit(Signals.Redundant, epoch)
      return await waitForRoundEnd(epoch, roundLockTime)
    }

    // Get up-to-date round data.
    round = await contract.rounds(epoch)
    emitter.emit(Signals.Bet, epoch, round)

    return await waitForRoundEnd(epoch, roundLockTime)
  }

  function useStrategy(s) {
    if (strategy) {
      for (const signal in strategy) {
        emitter.off(signal, strategy[signal])
      }
    }
    for (const signal in s) {
      emitter.on(signal, s[signal])
    }
    strategy = s
  }

  return {
    run: async (...window) => {
      console.log("Running...")
      while (running) {
        if (!(await emitSignals(...window))) {
          break
        }
      }
    },
    abort: () => {
      controller.abort()
      running = false
    },
    useStrategy,
  }
}
