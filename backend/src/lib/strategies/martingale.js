import Strategy from "../strategy.js"

export default class Martingale extends Strategy {
  constructor(baseAmount) {
    super("martingale")
    this.baseAmount = baseAmount
    this.betDirection = this.Direction.Bull
    this.betRound = false
  }

  getLastBetEntry(epoch) {
    return this.history[epoch - BigInt(2)]
  }

  bet(round) {
    this.betRound = !this.betRound
    if (!this.betRound) {
      return this.Direction.Skip
    }

    const entry = this.getLastBetEntry(round.epoch)
    if (entry) {
      this.amount = entry.win || !entry.bet ? this.baseAmount : this.amount * 2
    }

    return this.betDirection
  }
}
