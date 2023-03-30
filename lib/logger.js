import { Signals } from "./enums.js"
import { globalHistory } from "./history.js"

function bigintDiv(a, b) {
  if (b == 0) {
    return 0
  }
  return Number((a * 100n) / b) / 100
}

export default function Logger(name = "logger", func = console.log) {
  const signals = {}

  const data = {
    winning: false,
    streak: 0,
  }

  signals[Signals.Round.Start] = (round, roundTime) => {
    func(`Round ${round.epoch}: Started ${roundTime}s ago`)
  }
  signals[Signals.Round.BetWindow.Early] = (round, seconds) => {
    func(
      `Round ${round.epoch}: Waiting ${seconds}s for betting window to open...`
    )
  }
  signals[Signals.Round.BetWindow.Late] = (round) => {
    func(`Round ${round.epoch}: Betting window is already closed`)
  }
  signals[Signals.Round.AlreadyBet] = (round) => {
    func(`Round ${round.epoch}: A bet has already been placed`)
  }
  signals[Signals.Round.Bet] = (round, _) => {
    const bull = bigintDiv(round.totalAmount, round.bullAmount)
    const bear = bigintDiv(round.totalAmount, round.bearAmount)
    func(
      `Round ${round.epoch}: Betting window is open (bull ${bull}x, bear ${bear}x)`
    )
  }
  signals[Signals.Round.WaitForLock] = (round, seconds) => {
    func(`Round ${round.epoch}: Waiting ${seconds}s for round to lock...`)
  }
  signals[Signals.Round.Error] = (round, msg, err) => {
    func(`Round ${round.epoch}: ${msg}: ${err}`)
  }
  signals[Signals.Round.Close] = (round) => {
    const entry = globalHistory[round.epoch]

    if (entry.bet) {
      data.streak = (entry.win ? data.winning : !data.winning)
        ? data.streak + 1
        : 1
      data.winning = entry.win

      func(
        `Round ${round.epoch}: Result = ${entry.result} => ${
          entry.win ? "win" : "loss"
        } (${entry.amount}) [x${data.streak}]`
      )
    } else if (entry.skipped) {
      func(`Round ${round.epoch}: Result = ${entry.result} => skipped`)
    } else {
      func(`Round ${round.epoch}: Result = ${entry.result}`)
    }
  }
  signals[Signals.UseStrategy] = (strategy) => {
    func(`Using strategy: ${strategy.name}`)
  }

  return {
    name: name,
    signals,
  }
}
