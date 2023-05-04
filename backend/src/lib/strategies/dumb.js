import Strategy from "../strategy.js"
import { newFixedArray } from "../utils.js"

export default class Dumb extends Strategy {
  constructor(period = 12) {
    super("dumb")
    this.histories = [
      {
        ready: false,
        entries: newFixedArray(period),
      },
      {
        ready: false,
        entries: newFixedArray(period),
      },
    ]
    this.historyCallback = (round) => {
      const history = this.getHistory(round.epoch)
      history.ready = history.entries.add(round)
    }
  }

  getHistory(epoch) {
    return this.histories[epoch % BigInt(2)]
  }

  getChangeRate(entries) {
    let lastResult = entries[0].result

    const changes = entries.reduce((count, entry) => {
      if (entry.result !== lastResult) {
        count++
      }
      lastResult = entry.result
      return count
    }, 0)

    return Math.round((changes / (entries.length - 1)) * 100)
  }

  bet(round) {
    const history = this.getHistory(round.epoch)
    if (!history.ready) {
      return { direction: this.Direction.Skip }
    }
    const lastResult = history.entries[history.entries.length - 1].result
    const rate = this.getChangeRate(history.entries)
    return {
      direction:
        rate < 60
          ? lastResult
          : lastResult === this.Direction.Bull
          ? this.Direction.Bear
          : this.Direction.Bull,
      criteria: { rate },
    }
  }
}
