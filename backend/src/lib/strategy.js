import { Worker } from "worker_threads"

import { Direction, Signals } from "./enums.js"

const Observer = {
  History: "History",
}

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
    this.historyCallback = undefined
  }

  run(_) {}
  stop() {}
  bet(_) {}
  observer(type) {
    switch (type) {
      case Observer.History:
        return this.historyCallback === undefined
          ? undefined
          : {
              signals: {
                Update: (entry) => this.historyCallback(entry),
              },
            }
    }
  }
}

export class WorkerStrategy extends Strategy {
  constructor(name, workerName) {
    super(name)
    this.workerName = workerName
    this.betDirection = null
    this.criteria = {}
    this.worker = undefined
  }

  run(callback, data = undefined) {
    this.worker = new Worker(`./src/lib/workers/${this.workerName}.js`, {
      workerData: data,
    })

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
      console.log(`worker error: ${this.workerName}: ${e}`)
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
    return { direction: this.betDirection, criteria: this.criteria }
  }
}

export class PredictStreamStrategy extends WorkerStrategy {
  constructor({ type, interval, horizon }, workerName) {
    const model = [type, interval, horizon].join("_")
    super(["predict", "stream", model].join("_"), workerName)
    this.url = `${process.env.PREDICTION_STREAM_URL}/${model}`
  }

  run(callback) {
    super.run(callback, this.url)
  }
}

export class PredictQueryStrategy extends Strategy {
  constructor({ type, interval, horizon }, moment) {
    const model = [type, interval, horizon].join("_")
    const name = ["predict", "query", model]
    if (moment) {
      name.push("moment")
    }
    super(name.join("_"))
    this.url = `${process.env.PREDICTION_QUERY_URL}/${model}?moment=${moment}`
  }

  async bet(_) {
    const resp = await fetch(this.url)
    const json = await resp.json()
    const p = json.prediction === "1" ? Direction.Bull : Direction.Bear
    delete json.prediction
    return {
      direction: p,
      criteria: json,
    }
  }
}

export class StrategyEngine {
  constructor(strategies) {
    this.strategies = strategies
    this.activeName = strategies[0].name
    this.simulate = true
  }

  run(contract, loop, history) {
    loop.emitter.on(Signals.Round.Bet, (round) =>
      this.strategies.forEach(async (s) => {
        const { direction, criteria } = await s.bet(round)
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
          criteria: criteria || {},
          simulate: sim,
          error: error,
        })
      })
    )

    this.strategies.forEach((s) => {
      const obs = s.observer(Observer.History)
      if (obs !== undefined) {
        history.addObserver(obs)
      }
      s.run((data) => {
        if (s.name === this.activeName) {
          loop.emitter.emit(Signals.Broadcast, {
            strategy: s.name,
            ...data,
          })
        }
      })
    })
  }

  stop() {
    this.strategies.forEach((s) => s.stop())
  }
}
