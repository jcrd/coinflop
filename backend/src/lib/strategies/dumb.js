import { HistoryStrategy } from "../strategy.js"
import { newFixedArray } from "../utils.js"

export default class Dumb extends HistoryStrategy {
  constructor(period = 12) {
    super("dumb")
    this.ready = false
    this.historyRound = false
    this.history = newFixedArray(period)
    this.historyCallback = (round) => {
      // Round.Close signal comes after Round.Bet, so this determines if a bet is made in the *next* round.
      this.historyRound = !this.historyRound
      if (this.historyRound) {
        this.ready = history.add(round)
      }
    }
  }

  getChangeRate() {
    let lastResult = this.history[0].result

    const changes = this.history.reduce((count, entry) => {
      if (entry.result !== lastResult) {
        count++
      }
      lastResult = entry.result
      return count
    }, 0)

    return Math.round((changes / (this.history.length - 1)) * 100)
  }

  bet(_) {
    // Round history is received, and historyRound becomes true (round 1).
    // Bet is skipped, and historyRound becomes false (round 2).
    // Bet is placed, and historyRound becomes true (round 3).
    if (!this.ready || this.historyRound) {
      return this.Direction.Skip
    }
    const lastResult = this.history[this.history.length - 1].result
    const rate = this.getChangeRate()
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
