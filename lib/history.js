import { Direction, Signals } from "./enums.js"

export const globalHistory = {}

export function recordBet(epoch, direction, amount) {
  globalHistory[epoch] = { bet: direction, amount: amount }
}

export function skipBet(epoch) {
  globalHistory[epoch] = { skipped: true }
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

export default signals
