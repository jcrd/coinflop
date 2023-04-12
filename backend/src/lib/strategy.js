import { Worker } from "worker_threads"

import { Direction, Signals } from "./enums.js"

async function contractBet(contract, epoch, direction, amount) {
  try {
    if (direction !== Direction.Skip) {
      const tx = await contract["bet" + direction](epoch, {
        value: ethers.parseEther(amount),
      })
      await tx.wait()
    }
  } catch (e) {
    return e
  }
  return null
}

export default class Strategy {
  constructor(name) {
    this.name = name
    this.amount = 0.1
    this.Direction = Direction
    this.criteria = {}
  }

  run(_) {}
  stop() {}
  bet(_) {}
}

export class TAStrategy extends Strategy {
  constructor(name, taName, amount) {
    super(name, amount)
    this.taName = taName
    this.betDirection = null
    this.worker = undefined
  }

  run(callback) {
    this.worker = new Worker(`./src/lib/ta/workers/${this.taName}.js`)

    this.worker.on("message", (data) => {
      data.direction =
        data.direction === true
          ? Direction.Bull
          : data.direction === false
          ? Direction.Bear
          : Direction.Skip
      this.betDirection = data.direction
      this.criteria = data.criteria
      callback(data)
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

  bet(_) {
    return this.betDirection
  }
}

export class StrategyEngine {
  constructor(strategies) {
    this.strategies = strategies
    this.activeName = strategies[0].name
    this.simulate = true
  }

  run(contract, loop) {
    loop.emitter.on(Signals.Round.Bet, (round) =>
      this.strategies.forEach(async (s) => {
        const direction = s.bet(round)
        let error = null
        let sim = true

        if (!this.simulate && s.name === this.activeName) {
          error = await contractBet(contract, round.epoch, direction, s.amount)
          sim = false
        }

        loop.emitter.emit(Signals.Round.BetAction, {
          strategy: s.name,
          epoch: round.epoch,
          direction: direction,
          amount: s.amount,
          criteria: s.criteria,
          simulate: sim,
          error: error,
        })
      })
    )

    this.strategies.forEach((s) =>
      s.run((data) => {
        if (s.name === this.activeName) {
          loop.emitter.emit(Signals.Broadcast, {
            strategy: s.name,
            ...data,
          })
        }
      })
    )
  }

  stop() {
    this.strategies.forEach((s) => s.stop())
  }
}
