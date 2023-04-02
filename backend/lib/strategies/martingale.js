import Strategy from "../strategy.js"

export default class Martingale extends Strategy {
  constructor(baseAmount) {
    super("martingale")
    this.baseAmount = baseAmount
    this.amount = baseAmount
    this.betDirection = this.Direction.Bull
    this.betRound = false
  }

  getLastBetEntry(epoch) {
    return this.history[epoch - BigInt(2)]
  }

  betFactory() {
    return async (round, contract) => {
      this.betRound = !this.betRound
      if (!this.betRound) {
        await this.betAction(contract, round.epoch, null, this.amount)
        return
      }

      const entry = this.getLastBetEntry(round.epoch)
      if (entry) {
        this.amount =
          entry.win || !entry.bet ? this.baseAmount : this.amount * 2
      }

      await this.betAction(
        contract,
        round.epoch,
        this.betDirection,
        this.amount
      )
    }
  }
}
