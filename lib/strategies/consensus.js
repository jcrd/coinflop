import Signals from "../signals.js"
import * as bet from "../bet.js"

function getBetDirection(bull, bear, ratio = 5) {
  if (
    (bear > 0 && bull > bear && bull / bear < ratio) ||
    (bull < bear && bear / bull > ratio)
  ) {
    return bet.Direction.Bear
  }
  return bet.Direction.Bull
}

export default function (amount) {
  const signals = {}

  signals[Signals.Round.Bet] = (round, contract) => {
    console.log(
      `Round ${round.epoch}: Preparing to bet (bull ${round.bullAmount}, bear ${round.bearAmount})`
    )
    bet.place(
      contract,
      round.epoch,
      getBetDirection(round.bullAmount, round.bearAmount),
      amount
    )
  }

  return {
    name: "consensus",
    signals: signals,
  }
}
