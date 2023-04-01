import { Worker } from "worker_threads"

import { Direction, Signals } from "./enums.js"
import * as history from "./history.js"

export default class Strategy {
  constructor(name) {
    this.name = name
    this.Direction = Direction
    this.Signals = Signals
    this.history = history.globalHistory
    this.signalHandlers = {}
    this.simulate = true
    this.placeBetCallback = null
  }

  async placeBet(contract, epoch, direction, amount) {
    const data = {
      betPlaced: false,
      epoch,
      direction,
      amount,
      simulate: this.simulate,
      error: null,
    }
    try {
      if (!this.simulate) {
        const tx = await contract["bet" + direction](epoch, {
          value: ethers.parseEther(amount),
        })
        await tx.wait()
      }
      history.recordBet(epoch, direction, amount)
      data.betPlaced = true
    } catch (e) {
      data.error = e
    }
    if (this.placeBetCallback !== null) {
      this.placeBetCallback(data)
    }
  }

  skipBet(epoch) {
    history.skipBet(epoch)
  }

  observer() {
    if (!(this.Signals.Round.Bet in this.signalHandlers)) {
      this.signalHandlers[this.Signals.Round.Bet] = this.betFactory()
    }
    return {
      name: this.name,
      signals: this.signalHandlers,
    }
  }

  run(placeBetCallback, _ = undefined) {
    this.placeBetCallback = placeBetCallback
  }

  // betFactory returns a closure to be called by the main loop's event emitter.
  betFactory() {}
  stop() {}
}

export class TAStrategy extends Strategy {
  constructor(name, taName) {
    super(name)
    this.taName = taName
    this.direction = null
    this.worker = undefined
  }

  run(placeBetCallback, workerCallback) {
    super.run(placeBetCallback)
    this.worker = new Worker(`./lib/ta/workers/${this.taName}.js`)

    this.worker.on("message", (data) => {
      this.direction = data.state ? Direction.Bull : Direction.Bear
      workerCallback(data)
    })

    this.worker.on("error", (e) => {
      console.log(`ta error: ${this.taName}: ${e}`)
    })
  }

  stop() {
    if (this.worker) {
      this.worker.postMessage({ exit: true })
      this.worker = undefined
    }
  }
}
