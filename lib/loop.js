import { EventEmitter } from "events"
import { setTimeout } from "timers/promises"

import Signals from "./signals.js"

function getTimestamp() {
  return Math.floor(Date.now() / 1000)
}

export default function (contract, signer) {
  const emitter = new EventEmitter()
  const controller = new AbortController()

  let running = false
  let strategy

  async function wait(seconds) {
    try {
      // Convert to milliseconds.
      await setTimeout(seconds * 1000, null, {
        signal: controller.signal,
      })
    } catch (e) {
      if (e.name != "AbortError") {
        throw e
      }
    }
    return !controller.signal.aborted
  }

  async function waitForRoundEnd(epoch, seconds) {
    seconds += 6
    emitter.emit(Signals.WaitForEnd, epoch, seconds)
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
      emitter.emit(Signals.Early, epoch, waitSeconds)
      if (!(await wait(waitSeconds))) {
        return false
      }
      timestamp = getTimestamp()
    }

    const roundLockTime = Number(round.lockTimestamp) - timestamp

    if (roundLockTime < betWindowClose) {
      emitter.emit(Signals.Late, epoch)
      return await waitForRoundEnd(epoch, roundLockTime)
    }

    let currentBet

    try {
      const ledger = await contract.ledger(epoch, signer.address)
      currentBet = ledger.amount
    } catch (e) {
      emitter.emit(Signals.Error, e, "Failed to get ledger data")
      return false
    }

    if (currentBet > 0) {
      emitter.emit(Signals.Redundant, epoch)
      return await waitForRoundEnd(epoch, roundLockTime)
    }

    // Get up-to-date round data.
    round = await contract.rounds(epoch)
    emitter.emit(Signals.Bet, epoch, round)

    return await waitForRoundEnd(epoch, roundLockTime)
  }

  function addObserver(observer) {
    for (const signal in observer.signals) {
      emitter.on(signal, observer.signals[signal])
    }
  }

  function removeObserver(observer) {
    for (const signal in observer.signals) {
      emitter.off(signal, observer.signals[signal])
    }
  }

  function useStrategy(s) {
    const setStrategy = () => {
      if (strategy) {
        removeObserver(strategy)
      }
      addObserver(s)

      strategy = s

      emitter.emit(Signals.Meta.UseStrategy, s)
    }

    if (running) {
      emitter.once(Signals.End, setStrategy)
    } else {
      setStrategy()
    }
  }

  return {
    run: async (...window) => {
      running = true
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
    addObserver,
    removeObserver,
    useStrategy,
  }
}
