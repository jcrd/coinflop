import Signals from "../signals.js"
import * as bet from "../bet.js"

function getBetType(bull, bear, ratio = 5) {
  if (
    (bear > 0 && bull > bear && bull / bear < ratio) ||
    (bull < bear && bear / bull > ratio)
  ) {
    return bet.Type.Bear
  }
  return bet.Type.Bull
}

export default function (contract, amount) {
  const signals = {}

  signals[Signals.Bet] = (epoch, round) => {
    console.log(
      `Round ${epoch}: Preparing to bet (bull ${round.bullAmount}, bear ${round.bearAmount})`
    )
    bet.place(
      contract,
      epoch,
      getBetType(round.bullAmount, round.bearAmount),
      amount
    )
  }

  return {
    name: "consensus",
    signals: signals,
  }
}
