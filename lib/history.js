import { Direction } from "./bet.js"
import Signals from "./signals.js"

export const globalHistory = {}

export function recordBet(epoch, direction, amount) {
  globalHistory[epoch] = { bet: direction, amount: amount }
}

const signals = {}

signals[Signals.Round.Close] = (round) => {
  const epoch = round.epoch
  const result =
    round.closePrice > round.lockPrice ? Direction.Bull : Direction.Bear
  if (epoch in globalHistory) {
    const entry = globalHistory[epoch]
    entry.result = result
    entry.win = result == entry.bet
  } else {
    globalHistory[epoch] = { result: result }
  }
}

export default { signals: signals }
