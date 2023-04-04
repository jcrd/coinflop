import Strategy from "../strategy.js"

export default class Consensus extends Strategy {
  constructor(amount) {
    super("consensus")
    this.amount = amount
  }

  getBetDirection(bull, bear, ratio = 5) {
    if (
      (bear > 0 && bull > bear && bull / bear < ratio) ||
      (bull < bear && bear / bull > ratio)
    ) {
      return this.Direction.Bear
    }
    return this.Direction.Bull
  }

  betFactory() {
    return async (round, contract) => {
      await this.betAction(
        contract,
        round.epoch,
        this.getBetDirection(round.bullAmount, round.bearAmount),
        this.amount
      )
    }
  }
}