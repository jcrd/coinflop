import { TAStrategy } from "../strategy.js"

export default class TASimple extends TAStrategy {
  constructor(amount, simulate = true) {
    super("ta_simple", "simple")
    this.simulate = simulate
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
