import Strategy from "../strategy.js"

export default class Consensus extends Strategy {
  constructor() {
    super("consensus")
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

  bet(round) {
    return {
      direction: this.getBetDirection(round.bullAmount, round.bearAmount),
      criteria: {
        bull: Number(round.bullAmount),
        bear: Number(round.bearAmount),
      },
    }
  }
}
