import { Level } from "level"

import Emitter from "./emitter.js"
import { Direction, Signals } from "./enums.js"

export default class History extends Emitter {
  constructor(dbPath, name = "history") {
    super()
    this.name = name
    this.values = {}
    this.db = new Level(dbPath, { valueEncoding: "json" })

    this.signals = {
      [Signals.Round.BetAction.Placed]: async ({ epoch, direction, amount }) =>
        await this.update(epoch, { bet: direction, amount: amount }),
      [Signals.Round.BetAction.Skipped]: async ({ epoch }) =>
        await this.update(epoch, { skipped: true }),
      [Signals.Round.Close]: async (round) => {
        const epoch = round.epoch
        const result =
          round.closePrice > round.lockPrice ? Direction.Bull : Direction.Bear
        if (epoch in this.values) {
          const entry = this.values[epoch]
          entry.result = result
          entry.win = result == entry.bet
        } else {
          this.values[epoch] = { result: result }
        }
        await this.update(epoch, this.values[epoch])
      },
    }
  }

  async update(epoch, value) {
    this.values[epoch] = value
    this.emitter.emit("Update", Number(epoch), value)
    await this.db.put(epoch, value)
  }

  async load() {
    for await (const [epoch, value] of this.db.iterator()) {
      this.update(epoch, value)
    }
  }

  observer() {
    return {
      name: this.name,
      signals: this.signals,
    }
  }
}
