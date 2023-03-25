import { RSI } from "@debut/indicators"

import Period from "../period.js"

export class StochRSI {
  constructor(period = 14) {
    this.period = new Period(period)
    this.rsi = new RSI(period)
  }
  nextValue(value) {
    const rsi = this.rsi.nextValue(value)
    if (rsi !== undefined && this.period.nextValue(rsi)) {
      const denom = this.period.highest - this.period.lowest
      const v = denom == 0 ? 1.0 : (rsi - this.period.lowest) / denom
      return v
    }
    return undefined
  }
}
