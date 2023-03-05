import Signals from "./signals.js"

const logger = {}

logger[Signals.Early] = (epoch, seconds) => {
  console.log(
    `Round ${epoch}: Waiting ${seconds}s for betting window to open...`
  )
}
logger[Signals.Late] = (epoch) => {
  console.log(`Round ${epoch}: Betting window is already closed`)
}
logger[Signals.Redundant] = (epoch) => {
  console.log(`Round ${epoch}: A bet has already been placed`)
}
logger[Signals.WaitForEnd] = (epoch, seconds) => {
  console.log(`Round ${epoch}: Waiting ${seconds}s for round to end...`)
}
logger[Signals.Error] = (epoch, err, msg) => {
  console.log(`Round ${epoch}: ${msg}: ${err}`)
}

export default logger
