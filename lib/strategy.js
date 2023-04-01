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
  }

  async placeBet(contract, epoch, direction, amount) {
    console.log(`Round ${epoch}: Placing ${direction} bet...`)
    try {
      if (!this.simulate) {
        const tx = await contract["bet" + direction](epoch, {
          value: ethers.parseEther(amount),
        })
        await tx.wait()
        console.log(`Round ${epoch}: ${direction} bet placed (${amount})`)
      } else {
        console.log(`Round ${epoch}: ${direction} bet simulated (${amount})`)
      }
      history.recordBet(epoch, direction, amount)
      return true
    } catch (e) {
      console.log(`Round ${epoch}: Failed to place ${direction} bet: {e}`)
      return false
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

  // betFactory returns a closure to be called by the main loop's event emitter.
  betFactory() {}
  run(_) {}
  stop() {}
}

export class TAStrategy extends Strategy {
  constructor(name, taName) {
    super(name)
    this.taName = taName
    this.direction = null
    this.worker = undefined
  }

  run(callback) {
    this.worker = new Worker(`./lib/ta/workers/${this.taName}.js`)

    this.worker.on("message", (data) => {
      this.direction = data.state ? Direction.Bull : Direction.Bear
      callback(data)
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
