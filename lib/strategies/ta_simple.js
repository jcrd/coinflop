import { TAStrategy } from "../strategy.js"

export default class TASimple extends TAStrategy {
  constructor(amount) {
    super("ta_simple", "simple")
    this.amount = amount
  }

  bet(round, contract) {
    if (this.direction != undefined) {
      this.placeBet(contract, round.epoch, this.indicatorDirection, this.amount)
    }
  }
}
