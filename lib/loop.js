import { EventEmitter } from "events"
import { setTimeout } from "timers/promises"

import { Signals } from "./enums.js"

function getTimestamp() {
  return BigInt(Math.floor(Date.now() / 1000))
}

export default function (contract, signerAddress) {
  const emitter = new EventEmitter()
  const controller = new AbortController()
  const observers = {}

  let running = false
  let strategy

  async function wait(seconds) {
    // Convert to milliseconds.
    await setTimeout(Number(seconds) * 1000, null, {
      signal: controller.signal,
    })
  }

  async function waitForRoundLock(round, extraSeconds = 10) {
    const seconds = round.lockTimestamp - getTimestamp() + BigInt(extraSeconds)
    emitter.emit(Signals.Round.WaitForLock, round, seconds)
    await wait(seconds)
    emitter.emit(Signals.Round.Lock, round)
    emitter.emit(
      Signals.Round.Close,
      await contract.rounds(round.epoch - BigInt(1))
    )
  }

  async function emitSignals(betWindowOpen, betWindowClose) {
    betWindowOpen = BigInt(betWindowOpen)
    betWindowClose = BigInt(betWindowClose)

    const epoch = await contract.currentEpoch()
    const round = await contract.rounds(epoch)

    const roundTime = getTimestamp() - round.startTimestamp

    emitter.emit(Signals.Round.Start, round, roundTime)

    if (roundTime < betWindowOpen) {
      const waitSeconds = betWindowOpen - roundTime
      emitter.emit(Signals.Round.BetWindow.Early, round, waitSeconds)
      await wait(waitSeconds)
    }

    const roundLockTime = round.lockTimestamp - getTimestamp()

    if (roundLockTime < betWindowClose) {
      emitter.emit(Signals.Round.BetWindow.Late, round)
      await waitForRoundLock(round)
      return true
    }

    let currentBet

    try {
      const ledger = await contract.ledger(epoch, signerAddress)
      currentBet = ledger.amount
    } catch (e) {
      emitter.emit(Signals.Round.Error, round, "Failed to get ledger data", e)
      return false
    }

    if (currentBet > 0) {
      emitter.emit(Signals.Round.AlreadyBet, round)
      await waitForRoundLock(round)
      return true
    }

    // Get up-to-date round data.
    emitter.emit(Signals.Round.Bet, await contract.rounds(epoch), contract)

    await waitForRoundLock(round)
    return true
  }

  function addObserver(observer) {
    for (const signal in observer.signals) {
      emitter.on(signal, observer.signals[signal])
    }
    observers[observer.name] = observer
  }

  function removeObserver(name) {
    if (!(name in observers)) {
      return
    }
    const observer = observers[name]
    for (const signal in observer.signals) {
      emitter.off(signal, observer.signals[signal])
    }
  }

  function useStrategy(s) {
    const setStrategy = () => {
      if (strategy) {
        removeObserver(strategy.name)
        strategy.stop()
      }
      addObserver(s.observer())

      strategy = s

      strategy.run((data) => emitter.emit(Signals.Broadcast, data))
      emitter.emit(Signals.UseStrategy, strategy)
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
      try {
        while (running) {
          if (!(await emitSignals(...window))) {
            break
          }
        }
      } catch (e) {
        if (e.name != "AbortError") {
          throw e
        }
      }
      if (strategy) {
        strategy.stop()
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
