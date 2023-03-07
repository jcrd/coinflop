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

  async function waitForRoundLock(round, extraSeconds = 10) {
    const seconds = Number(round.lockTimestamp) - getTimestamp() + extraSeconds
    emitter.emit(Signals.Round.WaitForLock, round, seconds)
    if (!(await wait(seconds))) {
      return false
    }
    emitter.emit(Signals.Round.Lock, round)
    emitter.emit(
      Signals.Round.Close,
      await contract.rounds(round.epoch - BigInt(1))
    )
    return true
  }

  async function emitSignals(betWindowOpen, betWindowClose) {
    const epoch = await contract.currentEpoch()
    const round = await contract.rounds(epoch)

    const roundTime = getTimestamp() - Number(round.startTimestamp)

    emitter.emit(Signals.Round.Start, round, roundTime)

    if (roundTime < betWindowOpen) {
      const waitSeconds = betWindowOpen - roundTime
      emitter.emit(Signals.Round.BetWindow.Early, round, waitSeconds)
      if (!(await wait(waitSeconds))) {
        return false
      }
    }

    const roundLockTime = Number(round.lockTimestamp) - getTimestamp()

    if (roundLockTime < betWindowClose) {
      emitter.emit(Signals.Round.BetWindow.Late, round)
      return await waitForRoundLock(round)
    }

    let currentBet

    try {
      const ledger = await contract.ledger(epoch, signer.address)
      currentBet = ledger.amount
    } catch (e) {
      emitter.emit(Signals.Round.Error, round, "Failed to get ledger data", e)
      return false
    }

    if (currentBet > 0) {
      emitter.emit(Signals.Round.AlreadyBet, round)
      return await waitForRoundLock(round)
    }

    // Get up-to-date round data.
    emitter.emit(Signals.Round.Bet, await contract.rounds(epoch), contract)

    return await waitForRoundLock(round)
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

      emitter.emit(Signals.UseStrategy, s)
    }

    if (running) {
      emitter.once(Signals.Round.Lock, setStrategy)
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
