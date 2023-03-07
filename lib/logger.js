import Signals from "./signals.js"

const signals = {}

signals[Signals.Round.Start] = (round, roundTime) => {
  console.log(`Round ${round.epoch}: Started ${roundTime}s ago`)
}
signals[Signals.Round.BetWindow.Early] = (round, seconds) => {
  console.log(
    `Round ${round.epoch}: Waiting ${seconds}s for betting window to open...`
  )
}
signals[Signals.Round.BetWindow.Late] = (round) => {
  console.log(`Round ${round.epoch}: Betting window is already closed`)
}
signals[Signals.Round.AlreadyBet] = (round) => {
  console.log(`Round ${round.epoch}: A bet has already been placed`)
}
signals[Signals.Round.WaitForLock] = (round, seconds) => {
  console.log(`Round ${round.epoch}: Waiting ${seconds}s for round to lock...`)
}
signals[Signals.Round.Error] = (round, msg, err) => {
  console.log(`Round ${round.epoch}: ${msg}: ${err}`)
}
signals[Signals.UseStrategy] = (strategy) => {
  console.log(`Using strategy: ${strategy.name}`)
}

export default { signals: signals }
