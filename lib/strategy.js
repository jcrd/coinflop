import { Worker } from "worker_threads"

import Emitter from "./emitter.js"
import { Direction, Signals as GlobalSignals } from "./enums.js"

export const Signals = {
  PlaceBet: "PlaceBet",
  SkipBet: "SkipBet",
  TA: "TA",
}

export default class Strategy extends Emitter {
  constructor(name) {
    super()
    this.name = name
    this.Direction = Direction
    this.Signals = GlobalSignals
    this.signalHandlers = {}
    this.simulate = true
  }

  async placeBet(contract, epoch, direction, amount) {
    const data = {
      epoch,
      betPlaced: false,
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
      data.betPlaced = true
    } catch (e) {
      data.error = e
    }
    this.emitter.emit(Signals.PlaceBet, data)
  }

  skipBet(epoch) {
    this.emitter.emit(Signals.SkipBet, {
      epoch: epoch,
      betPlaced: false,
      error: null,
    })
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

  run(observer) {
    this.addObserver(observer)
  }

  stop() {
    this.removeAllObservers()
  }

  // betFactory returns a closure to be called by the main loop's event emitter.
  betFactory() {}
}

export class TAStrategy extends Strategy {
  constructor(name, taName) {
    super(name)
    this.taName = taName
    this.betState = null
    this.worker = undefined
  }

  run(observer) {
    super.run(observer)
    this.worker = new Worker(`./lib/ta/workers/${this.taName}.js`)

    this.worker.on("message", (data) => {
      this.betState =
        data.state === true
          ? Direction.Bull
          : data.state === false
          ? Direction.Bear
          : null
      this.emitter.emit(Signals.TA, data)
    })

    this.worker.on("error", (e) => {
      console.log(`ta error: ${this.taName}: ${e}`)
    })
  }

  stop() {
    super.stop()
    if (this.worker) {
      this.worker.postMessage({ exit: true })
      this.worker = undefined
    }
  }
}
