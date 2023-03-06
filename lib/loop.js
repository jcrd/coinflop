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

  async function waitForRoundEnd(round, extraSeconds = 6) {
    const seconds = Number(round.lockTimestamp) - getTimestamp() + extraSeconds
    emitter.emit(Signals.WaitForEnd, round.epoch, seconds)
    const r = await wait(seconds)
    emitter.emit(Signals.End, round.epoch)
    return r
  }

  async function emitSignals(betWindowOpen, betWindowClose) {
    const epoch = await contract.currentEpoch()
    const round = await contract.rounds(epoch)

    const roundTime = getTimestamp() - Number(round.startTimestamp)

    emitter.emit(Signals.Start, epoch)

    if (roundTime < betWindowOpen) {
      const waitSeconds = betWindowOpen - roundTime
      emitter.emit(Signals.Early, epoch, waitSeconds)
      if (!(await wait(waitSeconds))) {
        return false
      }
    }

    const roundLockTime = Number(round.lockTimestamp) - getTimestamp()

    if (roundLockTime < betWindowClose) {
      emitter.emit(Signals.Late, epoch)
      return await waitForRoundEnd(round)
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
      return await waitForRoundEnd(round)
    }

    // Get up-to-date round data.
    emitter.emit(Signals.Bet, epoch, await contract.rounds(epoch))

    return await waitForRoundEnd(round)
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
