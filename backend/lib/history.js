import Emitter from "./emitter.js"
import { Direction, Signals } from "./enums.js"

export default class History extends Emitter {
  constructor(name = "history") {
    super()
    this.name = name
    this.entries = {}

    this.signals = {
      [Signals.Round.BetAction]: async ({
        epoch,
        direction,
        amount,
        criteria,
      }) =>
        (this.entries[epoch] = {
          direction: direction,
          amount: amount,
          criteria: criteria,
        }),
      [Signals.Round.Close]: async (round) => {
        const epoch = round.epoch
        const result =
          round.closePrice > round.lockPrice ? Direction.Bull : Direction.Bear
        if (epoch in this.entries) {
          const entry = this.entries[epoch]
          entry.result = result
          entry.win = result === entry.direction
          this.emitter.emit("Update", { epoch: Number(epoch), ...entry })
        } else {
          this.entries[epoch] = { result: result }
        }
      },
    }
  }

  load(entries) {
    entries.forEach((entry) => {
      this.entries[entry.epoch] = entry
      this.emitter.emit("Load", entry)
    })
  }

  observer() {
    return {
      name: this.name,
      signals: this.signals,
    }
  }
}
