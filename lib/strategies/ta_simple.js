import { TAStrategy } from "../strategy.js"

export default class TASimple extends TAStrategy {
  constructor(amount) {
    super("ta_simple", "simple")
    this.amount = amount
  }

  betFactory() {
    return async (round, contract) => {
      if (this.direction !== null) {
        await this.placeBet(contract, round.epoch, this.direction, this.amount)
      }
    }
  }
}
