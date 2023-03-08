import Signals from "../signals.js"
import * as bet from "../bet.js"
import { globalHistory, skipBet } from "../history.js"

function getLastBetEntry(epoch) {
  return globalHistory[epoch - BigInt(2)]
}

export default function (baseAmount, direction = bet.Direction.Bull) {
  const signals = {}

  let amount = baseAmount
  let betRound = false

  signals[Signals.Round.Bet] = (round, contract) => {
    betRound = !betRound
    if (!betRound) {
      skipBet(round.epoch)
      return
    }

    const entry = getLastBetEntry(round.epoch)
    if (entry) {
      amount = entry.win || !entry.bet ? baseAmount : amount * 2
    }

    bet.place(contract, round.epoch, direction, amount)
  }

  return {
    name: "martingale",
    signals: signals,
  }
}
