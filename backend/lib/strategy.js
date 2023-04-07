import { Worker } from "worker_threads"

import Emitter from "./emitter.js"
import { Direction, Signals as GlobalSignals } from "./enums.js"

export const Signals = {
  BetAction: "BetAction",
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
    this.criteria = undefined
  }

  async betAction(contract, epoch, direction, amount) {
    const data = {
      epoch,
      direction,
      amount,
      simulate: this.simulate,
      criteria: this.criteria,
      error: null,
    }
    try {
      if (!this.simulate && direction !== Direction.Skip) {
        const tx = await contract["bet" + direction](epoch, {
          value: ethers.parseEther(amount),
        })
        await tx.wait()
      }
    } catch (e) {
      data.error = e
    }
    this.emitter.emit(Signals.BetAction, data)
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
    this.betDirection = null
    this.worker = undefined
  }

  run(observer) {
    super.run(observer)
    this.worker = new Worker(`./lib/ta/workers/${this.taName}.js`)

    this.worker.on("message", (data) => {
      data.direction =
        data.direction === true
          ? Direction.Bull
          : data.direction === false
          ? Direction.Bear
          : Direction.Skip
      this.betDirection = data.direction
      this.criteria = data.criteria
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
