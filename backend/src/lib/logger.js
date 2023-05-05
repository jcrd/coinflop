import { Direction, Signals } from "./enums.js"

function bigintDiv(a, b) {
  if (b == 0) {
    return 0
  }
  return Number((a * 100n) / b) / 100
}

export function Logger(name = "logger", func = console.log) {
  const signals = {}

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
  signals[Signals.Round.BetAction] = ({
    strategy,
    epoch,
    direction,
    amount,
    simulate,
    error,
  }) => {
    if (direction !== Direction.Skip) {
      if (simulate) {
        func(
          `Round ${epoch}: ${strategy}: ${direction} bet simulated (${amount})`
        )
      } else {
        func(`Round ${epoch}: ${strategy}: ${direction} bet placed (${amount})`)
      }
    } else if (error !== null) {
      func(
        `Round ${epoch}: ${strategy}: Failed to place ${direction} bet: ${error}`
      )
    } else {
      func(`Round ${epoch}: ${strategy}: Bet skipped`)
    }
  }
  signals[Signals.Round.WaitForLock] = (round, seconds) => {
    func(`Round ${round.epoch}: Waiting ${seconds}s for round to lock...`)
  }
  signals[Signals.Round.Error] = (round, msg, err) => {
    func(`Round ${round.epoch}: ${msg}: ${err}`)
  }

  return {
    name: name,
    signals,
  }
}

export function BroadcastLogger(name = "BroadcastLogger", func = console.log) {
  return {
    name,
    signals: {
      [Signals.Broadcast]: (data) => func(JSON.stringify(data, null, 2)),
    },
  }
}

export function HistoryLogger(name = "historyLogger", func = console.log) {
  const signals = {
    Update: (entry) => {
      entry.bets.forEach((bet) => {
        if (bet.direction === Direction.Skip) {
          func(
            `Round ${entry.epoch}: ${bet.strategy}: Result = ${entry.result} => skipped`
          )
        } else {
          func(
            `Round ${entry.epoch}: ${bet.strategy}: Result = ${
              entry.result
            } => ${bet.win ? "win" : "loss"}`
          )
        }
      })
    },
  }

  return {
    name: name,
    signals,
  }
}
