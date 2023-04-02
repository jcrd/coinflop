import { TAStrategy } from "../strategy.js"

export default class TASimple extends TAStrategy {
  constructor(amount) {
    super("ta_simple", "simple")
    this.amount = amount
  }

  betFactory() {
    return async (round, contract) => {
      await this.betAction(contract, round.epoch, this.betState, this.amount)
    }
  }
}
