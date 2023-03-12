import { Direction, Signals } from "./defs.js"
import * as history from "./history.js"

export default class Strategy {
  constructor() {
    this.Direction = Direction
    this.Signals = Signals
    this.history = history.globalHistory
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
    const signals = {}
    signals[Signals.Round.Bet] = this.bet
    return signals
  }
}
