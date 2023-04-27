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
        strategy,
        direction,
        amount,
        criteria,
      }) => {
        if (!(epoch in this.entries)) {
          this.entries[epoch] = { bets: [] }
        }
        this.entries[epoch].bets.push({
          strategy,
          direction,
          amount,
          criteria,
        })
      },
      [Signals.Round.Close]: async (round) => {
        const epoch = round.epoch
        const result =
          round.closePrice > round.lockPrice ? Direction.Bull : Direction.Bear
        if (epoch in this.entries) {
          const entry = this.entries[epoch]
          entry.result = result
          entry.bets.forEach((bet) => (bet.win = result === bet.direction))
          this.emitter.emit("Update", {
            epoch: Number(epoch),
            timestamp: {
              start: Number(round.startTimestamp),
              lock: Number(round.lockTimestamp),
              close: Number(round.closeTimestamp),
            },
            ...entry,
          })
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
