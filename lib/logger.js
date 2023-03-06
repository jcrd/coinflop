import Signals from "./signals.js"

const signals = {}

signals[Signals.Early] = (round, seconds) => {
  console.log(
    `Round ${round.epoch}: Waiting ${seconds}s for betting window to open...`
  )
}
signals[Signals.Late] = (round) => {
  console.log(`Round ${round.epoch}: Betting window is already closed`)
}
signals[Signals.Redundant] = (round) => {
  console.log(`Round ${round.epoch}: A bet has already been placed`)
}
signals[Signals.WaitForEnd] = (round, seconds) => {
  console.log(`Round ${round.epoch}: Waiting ${seconds}s for round to end...`)
}
signals[Signals.Error] = (round, msg, err) => {
  console.log(`Round ${round.epoch}: ${msg}: ${err}`)
}
signals[Signals.Meta.UseStrategy] = (strategy) => {
  console.log(`Using strategy: ${strategy.name}`)
}

export default { signals: signals }
