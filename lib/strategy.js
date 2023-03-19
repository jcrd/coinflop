import { Direction, Signals } from "./enums.js"
import * as history from "./history.js"

export default class Strategy {
  constructor(name) {
    this.name = name
    this.Direction = Direction
    this.Signals = Signals
    this.history = history.globalHistory
    this.signalHandlers = {}
  }

  async placeBet(contract, epoch, direction, amount) {
    console.log(`Round ${epoch}: Placing ${direction} bet...`)
    try {
      // const tx = await contract["bet" + direction](epoch, {
      //   value: ethers.parseEther(amount),
      // })
      // await tx.wait()
      console.log(`Round ${epoch}: ${direction} bet placed (${amount})`)
      history.recordBet(epoch, direction, amount)
      return true
    } catch (e) {
      console.log(`Round ${epoch}: Failed to place ${direction} bet: {e}`)
      return false
    }
  }

  skipBet(epoch) {
    history.skipBet(epoch)
  }

  observer() {
    if ("bet" in this) {
      this.signalHandlers[Signals.Round.Bet] = this.bet
    }
    return this.signalHandlers
  }
}
