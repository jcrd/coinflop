import { Direction } from "./bet.js"
import Signals from "./signals.js"

const history = {}

export function recordBet(epoch, direction, amount) {
  history[epoch] = { bet: direction, amount: amount }
}

const signals = {}

signals[Signals.Round.Close] = (round) => {
  const epoch = round.epoch
  const result =
    round.closePrice > round.lockPrice ? Direction.Bull : Direction.Bear
  if (epoch in history) {
    let entry = history[epoch]
    console.log(
      `Round ${epoch}: Result = ${result} => ${
        result == entry.bet ? "win" : "loss"
      } (${entry.amount})`
    )
    entry.result = result
  } else {
    console.log(`Round ${epoch}: Result = ${result}`)
    history[epoch] = { result: result }
  }
}

export default { signals: signals }
