import { Type as BetType } from "./bet.js"
import Signals from "./signals.js"

const history = {}

export function recordBet(epoch, type, amount) {
  history[epoch] = { bet: type, amount: amount }
}

const signals = {}

signals[Signals.Expire] = (round) => {
  const epoch = round.epoch
  const result =
    round.closePrice > round.lockPrice ? BetType.Bull : BetType.Bear
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
