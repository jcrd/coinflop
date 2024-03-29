import { setTimeout } from "timers/promises"

import Emitter from "./emitter.js"
import { Signals } from "./enums.js"

function getTimestamp() {
  return BigInt(Math.floor(Date.now() / 1000))
}

export default class Loop extends Emitter {
  constructor(contract, signerAddress) {
    super()
    this.contract = contract
    this.signerAddress = signerAddress
    this.lastEpoch = BigInt(0)

    this.controller = new AbortController()

    this.running = false

    this.emitter.on(Signals.Round.BetAction, ({ error }) => {
      if (error !== null) {
        running = false
      }
    })
  }

  async wait(seconds) {
    // Convert to milliseconds.
    await setTimeout(Number(seconds) * 1000, null, {
      signal: this.controller.signal,
    })
  }

  async waitForRoundLock(round, extraSeconds = 10) {
    const seconds = round.lockTimestamp - getTimestamp() + BigInt(extraSeconds)
    this.emitter.emit(Signals.Round.WaitForLock, round, seconds)
    await this.wait(seconds)
    this.emitter.emit(Signals.Round.Lock, round)
    this.emitter.emit(
      Signals.Round.Close,
      await this.contract.rounds(round.epoch - BigInt(1))
    )
  }

  async emitSignals(betWindowOpen, betWindowClose) {
    betWindowOpen = BigInt(betWindowOpen)
    betWindowClose = BigInt(betWindowClose)

    const epoch = await this.contract.currentEpoch()
    const round = await this.contract.rounds(epoch)

    const estEpoch = this.lastEpoch + BigInt(1)

    if (this.lastEpoch == 0 || round.epoch === estEpoch) {
      this.lastEpoch = round.epoch
    } else {
      console.log(
        `ERROR: Bad epoch received from contract: current ${round.epoch} != estimated ${estEpoch}; retrying...`
      )
      return true
    }

    const roundTime = getTimestamp() - round.startTimestamp

    this.emitter.emit(Signals.Round.Start, round, roundTime)

    if (roundTime < betWindowOpen) {
      const waitSeconds = betWindowOpen - roundTime
      this.emitter.emit(Signals.Round.BetWindow.Early, round, waitSeconds)
      await this.wait(waitSeconds)
    }

    const roundLockTime = round.lockTimestamp - getTimestamp()

    if (roundLockTime < betWindowClose) {
      this.emitter.emit(Signals.Round.BetWindow.Late, round)
      await this.waitForRoundLock(round)
      return true
    }

    let currentBet

    try {
      const ledger = await this.contract.ledger(epoch, this.signerAddress)
      currentBet = ledger.amount
    } catch (e) {
      this.emitter.emit(
        Signals.Round.Error,
        round,
        "Failed to get ledger data",
        e
      )
      return false
    }

    if (currentBet > 0) {
      this.emitter.emit(Signals.Round.AlreadyBet, round)
      await this.waitForRoundLock(round)
      return true
    }

    // Get up-to-date round data.
    this.emitter.emit(Signals.Round.Bet, await this.contract.rounds(epoch))

    await this.waitForRoundLock(round)
    return true
  }

  async run(...window) {
    this.running = true
    try {
      while (this.running) {
        if (!(await this.emitSignals(...window))) {
          break
        }
      }
    } catch (e) {
      if (e.name != "AbortError") {
        throw e
      }
    }
  }

  abort() {
    this.controller.abort()
    this.running = false
  }
}
