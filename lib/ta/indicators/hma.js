import { WMA } from "@debut/indicators"

export class HMA {
  constructor(period) {
    this.wmaFull = new WMA(period)
    this.wmaHalf = new WMA(Math.round(period / 2))
    this.wmaSmooth = new WMA(Math.round(Math.sqrt(period)))
  }

  nextValue(value) {
    const full = this.wmaFull.nextValue(value)
    const half = this.wmaHalf.nextValue(value)
    if (full === undefined || half === undefined) {
      return undefined
    }
    const raw = 2 * half - full
    return this.wmaSmooth.nextValue(raw)
  }
}
