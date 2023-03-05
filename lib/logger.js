import Signals from "./signals.js"

const signals = {}

signals[Signals.Early] = (epoch, seconds) => {
  console.log(
    `Round ${epoch}: Waiting ${seconds}s for betting window to open...`
  )
}
signals[Signals.Late] = (epoch) => {
  console.log(`Round ${epoch}: Betting window is already closed`)
}
signals[Signals.Redundant] = (epoch) => {
  console.log(`Round ${epoch}: A bet has already been placed`)
}
signals[Signals.WaitForEnd] = (epoch, seconds) => {
  console.log(`Round ${epoch}: Waiting ${seconds}s for round to end...`)
}
signals[Signals.Error] = (epoch, err, msg) => {
  console.log(`Round ${epoch}: ${msg}: ${err}`)
}

export default { signals: signals }
